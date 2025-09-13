import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell, Database, Download, Upload, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    alerts: true,
    optimization: true,
    maintenance: false,
    reports: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoOptimization: true,
    emergencyOverride: true,
    dataRetention: '90',
    updateInterval: '30'
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSystemSettingChange = (key: string, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-settings">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system preferences and user settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Dr. Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="rajesh.kumar@odisha.gov.in" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue="Electronics & IT Department" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">System Administrator</SelectItem>
                      <SelectItem value="operator">Traffic Operator</SelectItem>
                      <SelectItem value="analyst">Data Analyst</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure general system behavior and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Auto-refresh Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Enable AI Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to automatically optimize traffic signals
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.autoOptimization}
                  onCheckedChange={(value) => handleSystemSettingChange('autoOptimization', value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Time Zone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                    <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Critical Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Traffic emergencies and system failures
                  </p>
                </div>
                <Switch 
                  checked={notifications.alerts}
                  onCheckedChange={(value) => handleNotificationChange('alerts', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">AI Optimization Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    AI recommendations and optimization results
                  </p>
                </div>
                <Switch 
                  checked={notifications.optimization}
                  onCheckedChange={(value) => handleNotificationChange('optimization', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Maintenance Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled maintenance and system updates
                  </p>
                </div>
                <Switch 
                  checked={notifications.maintenance}
                  onCheckedChange={(value) => handleNotificationChange('maintenance', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Daily Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Daily summary and performance reports
                  </p>
                </div>
                <Switch 
                  checked={notifications.reports}
                  onCheckedChange={(value) => handleNotificationChange('reports', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="secondary">Not Enabled</Badge>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">Session Timeout</p>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Configure data retention and backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select 
                  value={systemSettings.dataRetention}
                  onValueChange={(value) => handleSystemSettingChange('dataRetention', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Data Export & Import</h4>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="p-4 border border-destructive rounded-lg">
                  <div className="space-y-2">
                    <p className="font-medium">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all traffic data and analytics. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                System-level settings for advanced users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Update Interval (seconds)</Label>
                <Input 
                  type="number"
                  value={systemSettings.updateInterval}
                  onChange={(e) => handleSystemSettingChange('updateInterval', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Emergency Override</p>
                  <p className="text-sm text-muted-foreground">
                    Allow manual override of AI recommendations in emergencies
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.emergencyOverride}
                  onCheckedChange={(value) => handleSystemSettingChange('emergencyOverride', value)}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">System Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>System Version:</span>
                    <span className="text-muted-foreground">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Version:</span>
                    <span className="text-muted-foreground">PostgreSQL 15.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Model Version:</span>
                    <span className="text-muted-foreground">v2.1.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update:</span>
                    <span className="text-muted-foreground">2024-09-13 14:30:00</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline">Download System Logs</Button>
                <Button variant="outline">Run System Diagnostics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}