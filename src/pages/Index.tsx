import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, storage, type Review, type User } from '@/lib/api';

const marketplaces = [
  { id: 'wb', name: 'Wildberries', icon: '🛍️', color: 'bg-purple-100 hover:bg-purple-200' },
  { id: 'ozon', name: 'OZON', icon: '🔵', color: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'yandex', name: 'Яндекс Маркет', icon: '🟡', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { id: 'mega', name: 'Мега Маркет', icon: '🟠', color: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'magnit', name: 'Магнит Маркет', icon: '🔴', color: 'bg-red-100 hover:bg-red-200' },
];

const marketplacesMap: { [key: string]: number } = {
  'wb': 1,
  'ozon': 2,
  'yandex': 3,
  'mega': 4,
  'magnit': 5,
};

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getAll({ status: 'approved', limit: 50 });
      setReviews(data.reviews);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      setLoading(true);
      if (authMode === 'register') {
        const username = formData.get('username') as string;
        const result = await api.auth.register(email, username, password);
        setUser(result.user);
        storage.setUser(result.user);
        storage.setToken(result.token);
        toast({ title: 'Успешно!', description: 'Регистрация прошла успешно' });
      } else {
        const result = await api.auth.login(email, password);
        setUser(result.user);
        storage.setUser(result.user);
        storage.setToken(result.token);
        toast({ title: 'Добро пожаловать!', description: `Привет, ${result.user.username}` });
      }
      setActiveTab('home');
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuth();
    setUser(null);
    toast({ title: 'Выход', description: 'Вы вышли из аккаунта' });
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Ошибка', description: 'Необходимо авторизоваться', variant: 'destructive' });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const marketplaceCode = formData.get('marketplace') as string;
    
    try {
      setLoading(true);
      await api.reviews.create(
        {
          marketplace_id: marketplacesMap[marketplaceCode],
          article: formData.get('article') as string,
          product_link: formData.get('link') as string,
          seller_name: formData.get('seller') as string,
          rating: parseInt(formData.get('rating') as string),
          review_text: formData.get('review') as string,
          moderation_screenshots: [],
          public_photos: [],
        },
        String(user.id)
      );
      toast({ title: 'Отлично!', description: 'Отзыв отправлен на модерацию' });
      e.currentTarget.reset();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="MessageSquare" size={24} />
            <h1 className="text-xl font-bold">Честный Отзыв</h1>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">{user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/90">
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('profile')} className="text-primary-foreground hover:bg-primary/90">
              <Icon name="User" size={20} />
            </Button>
          )}
        </div>
      </header>

      <nav className="bg-card border-b sticky top-[52px] z-40">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex overflow-x-auto scrollbar-hide">
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
            {user?.is_admin && (
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
          <div className="md:hidden py-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="w-full justify-start"></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Навигация</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
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
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon name={tab.icon as any} size={20} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  {user?.is_admin && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon name="Shield" size={20} />
                      <span>Админ</span>
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
                    {!user ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">Необходимо авторизоваться</p>
                        <Button onClick={() => setActiveTab('profile')}>Войти</Button>
                      </div>
                    ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label htmlFor="marketplace">Маркетплейс *</Label>
                        <select
                          id="marketplace"
                          name="marketplace"
                          required
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
                        <Input id="article" name="article" required placeholder="Например: WB12345678" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="link">Ссылка на товар</Label>
                        <Input id="link" name="link" placeholder="https://..." className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="seller">Продавец</Label>
                        <Input id="seller" name="seller" placeholder="Название продавца" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="rating">Оценка *</Label>
                        <select id="rating" name="rating" required className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background">
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
                          name="review"
                          required
                          placeholder="Опишите вашу ситуацию подробно..."
                          className="mt-1 min-h-[120px]"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Отправка...' : 'Отправить на модерацию'}
                      </Button>
                    </form>
                    )}
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
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Загрузка...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Отзывов пока нет</p>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {review.marketplace_icon} {review.marketplace_name}
                            </Badge>
                            <p className="font-medium">{review.article}</p>
                            {review.seller_name && (
                              <p className="text-sm text-muted-foreground">{review.seller_name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.created_at).toLocaleDateString('ru')}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mt-3">{review.review_text}</p>
                        {review.public_photos?.length > 0 && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <Icon name="Image" size={14} />
                            <span>Есть фото</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
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
                {!user ? (
                  <div className="max-w-sm mx-auto">
                    <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <form onSubmit={handleAuth} className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="password">Пароль</Label>
                            <Input id="password" name="password" type="password" required className="mt-1" />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="register">
                        <form onSubmit={handleAuth} className="space-y-4">
                          <div>
                            <Label htmlFor="reg-email">Email</Label>
                            <Input id="reg-email" name="email" type="email" required className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="username">Имя пользователя</Label>
                            <Input id="username" name="username" required className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="reg-password">Пароль</Label>
                            <Input id="reg-password" name="password" type="password" required className="mt-1" />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Icon name="User" size={40} className="text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.is_admin && (
                        <Badge className="mt-2">Администратор</Badge>
                      )}
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
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        Выйти
                      </Button>
                    </div>
                  </>
                )}
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

        {activeTab === 'admin' && user?.is_admin && (
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


    </div>
  );
}