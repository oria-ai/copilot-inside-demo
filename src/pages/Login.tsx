import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { userStorage } from '@/lib/localStorage';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const api = 'http://localhost:4000';

// Default users for demo purposes 
const DEFAULT_USERS = {
  student: {
    id: 'default-student',
    email: 'oria@gmail.com', 
    password: '1234shir',
    name: 'אוריה',
    department: 'פיתוח',
    copilotLanguage: 'hebrew',
    studyingLanguage: 'hebrew',
    role: 'student'
  },
  manager: {
    id: 'default-manager',
    email: 'manager@gmail.com',
    password: '1234', 
    name: 'מנהל',
    role: 'manager'
  }
};

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: '',
    copilotLanguage: '',
    studyingLanguage: '',
    role: 'student',
    name: ''
  });
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tab === 'signup') {
        // Create new user and save to database
        const res = await fetch(`${api}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Signup failed');
        const user = await res.json();
        
        // Save user to localStorage
        userStorage.saveCurrentUser(user);
        onLogin(user);
      } else {
        // Check if it's a default user
        const defaultUser = Object.values(DEFAULT_USERS).find(
          user => user.email === formData.email && user.password === formData.password
        );
        if (defaultUser) {
          userStorage.saveCurrentUser(defaultUser);
          onLogin(defaultUser);
          return;
        }
        
        // Try to login with API
        const res = await fetch(`${api}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        if (!res.ok) throw new Error('Login failed');
        const user = await res.json();
        
        // Save user to localStorage
        userStorage.saveCurrentUser(user);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative" dir="rtl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: '0.8',
          filter: 'brightness(1.2)'
        }}
      />
      {/* Content Container - Now with relative positioning to appear above background */}
      <div className="relative z-10 flex w-full md:w-1/2 justify-center items-center min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#00A3D5] to-[#00C49A] bg-clip-text text-transparent">Copilot Inside</CardTitle>
              {/* <p className="text-gray-600">התחברות למערכת הלמידה</p> */}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={tab} onValueChange={v => setTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup">הרשמה</TabsTrigger>
                  <TabsTrigger value="signin">התחברות</TabsTrigger>
                </TabsList>
                {error && <div className="text-red-500 text-center mb-2">{error}</div>}
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-email">אימייל</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-password">סיסמה</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="name">שם</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="department">מחלקה</Label>
                      <Select onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="בחר מחלקה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">פיתוח</SelectItem>
                          <SelectItem value="digital">מנהלים</SelectItem>
                          <SelectItem value="finance">דיגיטל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2 text-right dir-rtl">
                        <Label htmlFor="copilot-language">הקופיילוט שלך ב</Label>
                        <Select onValueChange={(value) => handleInputChange('copilotLanguage', value)}>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר שפה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hebrew">עברית</SelectItem>
                            <SelectItem value="english">אנגלית</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2 text-right">
                        <Label htmlFor="studying-language">שפת לימוד</Label>
                        <Select onValueChange={(value) => handleInputChange('studyingLanguage', value)}>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר שפה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hebrew">עברית</SelectItem>
                            <SelectItem value="english">אנגלית</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button type="submit" className="w-[60%] bg-blue-600 hover:bg-blue-700">
                        הירשם
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="signin">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="password">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button type="submit" className="w-[60%] bg-blue-600 hover:bg-blue-700">
                        התחבר
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Right Side - Image as background, 50% width */}
      <div className="relative z-10 w-full md:w-1/2 h-[40vh] md:h-screen flex items-center justify-center">
        <img
          src="/squarelogo.png"
          alt="Copilot Inside Logo"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};

export default Login;
