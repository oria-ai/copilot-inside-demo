
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const api = 'http://localhost:4000';

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
        const res = await fetch(`${api}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Signup failed');
        const user = await res.json();
        onLogin(user);
      } else {
        const res = await fetch(`${api}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        if (!res.ok) throw new Error('Login failed');
        const user = await res.json();
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
    <div className="min-h-screen flex" dir="rtl">
      {/* Image Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center p-12">
        <div className="text-center">
          <img 
            src="/squarelogo.png" 
            alt="Copilot Inside by HandsOnAI" 
            className="max-w-md mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-white mb-4">ברוכים הבאים</h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            פלטפורמת הלמידה המתקדמת עם בינה מלאכותית
          </p>
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">Copilot Inside</CardTitle>
              <p className="text-gray-600 text-lg">התחברות למערכת הלמידה</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="signin" value={tab} onValueChange={v => setTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100">
                  <TabsTrigger value="signin" className="text-base font-medium">התחברות</TabsTrigger>
                  <TabsTrigger value="signup" className="text-base font-medium">הרשמה</TabsTrigger>
                </TabsList>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
                    {error}
                  </div>
                )}

                <TabsContent value="signin">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="email" className="text-base font-medium text-gray-700">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="הזן את האימייל שלך"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="password" className="text-base font-medium text-gray-700">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="הזן את הסיסמה שלך"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      התחבר
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-email" className="text-base font-medium text-gray-700">אימייל</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="הזן את האימייל שלך"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-password" className="text-base font-medium text-gray-700">סיסמה</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="הזן סיסמה חדשה"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="name" className="text-base font-medium text-gray-700">שם</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="הזן את שמך המלא"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="department" className="text-base font-medium text-gray-700">מחלקה</Label>
                      <Select onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="בחר מחלקה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">פיתוח</SelectItem>
                          <SelectItem value="digital">מנהלים</SelectItem>
                          <SelectItem value="finance">דיגיטל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="copilot-language" className="text-base font-medium text-gray-700">שפת קופיילוט</Label>
                      <Select onValueChange={(value) => handleInputChange('copilotLanguage', value)}>
                        <SelectTrigger className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="בחר שפה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hebrew">עברית</SelectItem>
                          <SelectItem value="english">אנגלית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="studying-language" className="text-base font-medium text-gray-700">שפת לימוד</Label>
                      <Select onValueChange={(value) => handleInputChange('studyingLanguage', value)}>
                        <SelectTrigger className="text-right h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="בחר שפה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hebrew">עברית</SelectItem>
                          <SelectItem value="english">אנגלית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      הירשם
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
