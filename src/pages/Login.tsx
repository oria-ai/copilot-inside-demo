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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Copilot Inside</CardTitle>
          <p className="text-gray-600">התחברות למערכת הלמידה</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" value={tab} onValueChange={v => setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">התחברות</TabsTrigger>
              <TabsTrigger value="signup">הרשמה</TabsTrigger>
            </TabsList>
            {error && <div className="text-red-500 text-center mb-2">{error}</div>}
            <TabsContent value="signin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  התחבר
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="copilot-language">שפת קופיילוט</Label>
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="role">תפקיד</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר תפקיד" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">סטודנט</SelectItem>
                      <SelectItem value="manager">מנהל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  הירשם
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
