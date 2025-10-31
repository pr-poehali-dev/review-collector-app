'''
Business: CRUD operations for reviews with moderation support
Args: event with httpMethod, body (JSON with review data), queryStringParameters (search params)
      context with request_id, function_name attributes
Returns: HTTP response with review data or list of reviews
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            status = params.get('status', 'approved')
            marketplace_id = params.get('marketplace_id')
            article = params.get('article')
            seller = params.get('seller')
            user_id = params.get('user_id')
            limit = int(params.get('limit', 50))
            
            query = """
                SELECT r.*, m.name as marketplace_name, m.icon as marketplace_icon,
                       u.username as user_username
                FROM reviews r
                JOIN marketplaces m ON r.marketplace_id = m.id
                JOIN users u ON r.user_id = u.id
                WHERE 1=1
            """
            query_params: List[Any] = []
            
            if status:
                query += " AND r.status = %s"
                query_params.append(status)
            
            if marketplace_id:
                query += " AND r.marketplace_id = %s"
                query_params.append(int(marketplace_id))
            
            if article:
                query += " AND r.article ILIKE %s"
                query_params.append(f'%{article}%')
            
            if seller:
                query += " AND r.seller_name ILIKE %s"
                query_params.append(f'%{seller}%')
            
            if user_id:
                query += " AND r.user_id = %s"
                query_params.append(int(user_id))
            
            query += " ORDER BY r.created_at DESC LIMIT %s"
            query_params.append(limit)
            
            cur.execute(query, query_params)
            reviews = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'reviews': [dict(r) for r in reviews]
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            user_id = headers.get('X-User-Id') or headers.get('x-user-id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication required'}),
                    'isBase64Encoded': False
                }
            
            marketplace_id = body_data.get('marketplace_id')
            article = body_data.get('article', '').strip()
            product_link = body_data.get('product_link', '').strip()
            seller_name = body_data.get('seller_name', '').strip()
            rating = body_data.get('rating')
            review_text = body_data.get('review_text', '').strip()
            moderation_screenshots = body_data.get('moderation_screenshots', [])
            public_photos = body_data.get('public_photos', [])
            
            if not all([marketplace_id, article, rating, review_text]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Marketplace, article, rating and review text are required'}),
                    'isBase64Encoded': False
                }
            
            if not (1 <= rating <= 5):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """
                INSERT INTO reviews (
                    user_id, marketplace_id, article, product_link, seller_name,
                    rating, review_text, moderation_screenshots, public_photos, status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id, created_at
                """,
                (user_id, marketplace_id, article, product_link or None, seller_name or None,
                 rating, review_text, moderation_screenshots, public_photos)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'review_id': result['id'],
                    'created_at': str(result['created_at'])
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            user_id = headers.get('X-User-Id') or headers.get('x-user-id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication required'}),
                    'isBase64Encoded': False
                }
            
            review_id = body_data.get('review_id')
            new_status = body_data.get('status')
            admin_comment = body_data.get('admin_comment')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user or not user['is_admin']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            if new_status:
                cur.execute(
                    "UPDATE reviews SET status = %s, admin_comment = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (new_status, admin_comment, review_id)
                )
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Review updated'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
