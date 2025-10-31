import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const marketplaces = [
  { id: 'wb', name: 'Wildberries', icon: '🛍️', color: 'bg-purple-100 hover:bg-purple-200' },
  { id: 'ozon', name: 'OZON', icon: '🔵', color: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'yandex', name: 'Яндекс Маркет', icon: '🟡', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { id: 'mega', name: 'Мега Маркет', icon: '🟠', color: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'magnit', name: 'Магнит Маркет', icon: '🔴', color: 'bg-red-100 hover:bg-red-200' },
];

const mockReviews = [
  {
    id: 1,
    marketplace: 'Wildberries',
    article: 'WB12345678',
    seller: 'ООО "Продавец"',
    rating: 1,
    text: 'Товар не соответствует описанию. Отзыв не прошёл модерацию на площадке.',
    date: '2024-10-25',
    hasScreenshots: true,
  },
  {
    id: 2,
    marketplace: 'OZON',
    article: 'OZ87654321',
    seller: 'Магазин текстиля',
    rating: 2,
    text: 'Долгая доставка, качество ниже ожидаемого. Площадка удалила честный отзыв.',
    date: '2024-10-20',
    hasScreenshots: true,
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="MessageSquare" size={24} />
            <h1 className="text-xl font-bold">Честные Отзывы</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/90">
            <Icon name="User" size={20} />
          </Button>
        </div>
      </header>

      <nav className="bg-card border-b sticky top-[52px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'home', label: 'Главная', icon: 'Home' },
              { id: 'search', label: 'Поиск', icon: 'Search' },
              { id: 'catalog', label: 'Каталог', icon: 'ShoppingBag' },
              { id: 'profile', label: 'Профиль', icon: 'User' },
              { id: 'rules', label: 'Правила', icon: 'FileText' },
              { id: 'support', label: 'Поддержка', icon: 'HelpCircle' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon as any} size={18} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === 'admin'
                    ? 'text-primary border-b-2 border-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Shield" size={18} />
                <span className="text-sm">Админ</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 pb-20">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                  Добро пожаловать!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Платформа для публикации честных отзывов, которые не прошли модерацию на маркетплейсах.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить отзыв
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Новый отзыв</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="marketplace">Маркетплейс *</Label>
                        <select
                          id="marketplace"
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Выберите маркетплейс</option>
                          {marketplaces.map((mp) => (
                            <option key={mp.id} value={mp.id}>
                              {mp.icon} {mp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="article">Артикул товара *</Label>
                        <Input id="article" placeholder="Например: WB12345678" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="link">Ссылка на товар</Label>
                        <Input id="link" placeholder="https://..." className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="seller">Продавец</Label>
                        <Input id="seller" placeholder="Название продавца" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="rating">Оценка *</Label>
                        <select id="rating" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background">
                          <option value="1">⭐ 1 - Ужасно</option>
                          <option value="2">⭐⭐ 2 - Плохо</option>
                          <option value="3">⭐⭐⭐ 3 - Средне</option>
                          <option value="4">⭐⭐⭐⭐ 4 - Хорошо</option>
                          <option value="5">⭐⭐⭐⭐⭐ 5 - Отлично</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="screenshots">Скриншоты модерации *</Label>
                        <Input id="screenshots" type="file" accept="image/*" multiple className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Только для модератора
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="photos">Фото для пользователей</Label>
                        <Input id="photos" type="file" accept="image/*" multiple className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="review">Текст отзыва *</Label>
                        <Textarea
                          id="review"
                          placeholder="Опишите вашу ситуацию подробно..."
                          className="mt-1 min-h-[120px]"
                        />
                      </div>
                      <Button className="w-full">Отправить на модерацию</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Clock" size={20} />
                Последние отзывы
              </h2>
              <div className="space-y-3">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {review.marketplace}
                          </Badge>
                          <p className="font-medium">{review.article}</p>
                          <p className="text-sm text-muted-foreground">{review.seller}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-sm mt-3">{review.text}</p>
                      {review.hasScreenshots && (
                        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                          <Icon name="Image" size={14} />
                          <span>Есть скриншоты</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Search" size={24} className="text-primary" />
                  Поиск отзывов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Поиск по артикулу, ссылке или продавцу</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Введите артикул, ссылку или имя продавца..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button>
                      <Icon name="Search" size={18} />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Фильтр по маркетплейсу</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {marketplaces.map((mp) => (
                      <Badge key={mp.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {mp.icon} {mp.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {searchQuery && (
              <div className="space-y-3">
                <h3 className="font-semibold">Результаты поиска</h3>
                <p className="text-sm text-muted-foreground">Найдено 0 отзывов</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingBag" size={24} className="text-primary" />
                  Каталог маркетплейсов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {marketplaces.map((mp) => (
                    <button
                      key={mp.id}
                      className={`${mp.color} p-6 rounded-xl transition-all hover:scale-105 active:scale-95`}
                    >
                      <div className="text-4xl mb-2">{mp.icon}</div>
                      <h3 className="font-semibold text-lg">{mp.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Смотреть отзывы</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} className="text-primary" />
                  Личный кабинет
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Icon name="User" size={40} className="text-primary" />
                  </div>
                  <Button variant="outline">Войти / Регистрация</Button>
                </div>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Icon name="FileText" size={20} />
                    <span>Мои отзывы</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Icon name="Bell" size={20} />
                    <span>Уведомления</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Icon name="Settings" size={20} />
                    <span>Настройки</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={24} className="text-primary" />
                  Правила публикации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="text-primary mt-1">✓</div>
                    <div>
                      <h4 className="font-medium">Честность превыше всего</h4>
                      <p className="text-sm text-muted-foreground">
                        Публикуйте только правдивые отзывы, подтверждённые скриншотами.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-primary mt-1">✓</div>
                    <div>
                      <h4 className="font-medium">Обязательные поля</h4>
                      <p className="text-sm text-muted-foreground">
                        Артикул товара и скриншоты модерации обязательны для публикации.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-destructive mt-1">✗</div>
                    <div>
                      <h4 className="font-medium">Запрещено</h4>
                      <p className="text-sm text-muted-foreground">
                        Оскорбления, ненормативная лексика, персональные данные третьих лиц.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-primary mt-1">✓</div>
                    <div>
                      <h4 className="font-medium">Модерация</h4>
                      <p className="text-sm text-muted-foreground">
                        Все отзывы проходят модерацию в течение 24 часов.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="HelpCircle" size={24} className="text-primary" />
                  Поддержка и контакты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="text-2xl">📧</div>
                    <div className="text-left">
                      <h4 className="font-medium">Email</h4>
                      <p className="text-sm text-muted-foreground">support@reviews.ru</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="text-2xl">💬</div>
                    <div className="text-left">
                      <h4 className="font-medium">Telegram</h4>
                      <p className="text-sm text-muted-foreground">@reviews_support</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="text-2xl">❓</div>
                    <div className="text-left">
                      <h4 className="font-medium">FAQ</h4>
                      <p className="text-sm text-muted-foreground">Часто задаваемые вопросы</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={24} className="text-primary" />
                  Администрирование
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reviews">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reviews">Отзывы на модерации</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                  </TabsList>
                  <TabsContent value="reviews" className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">Нет отзывов на модерации</p>
                  </TabsContent>
                  <TabsContent value="users" className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">Список пользователей пуст</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t py-2 text-center text-xs text-muted-foreground">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="hover:text-foreground transition-colors"
        >
          {isAdmin ? '👤 Режим пользователя' : '🔐 Режим администратора'}
        </button>
      </footer>
    </div>
  );
}
