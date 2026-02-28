import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format, subDays } from 'date-fns';
import { BarChart3, PieChart as PieChartIcon, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';

const CHART_COLORS = [
  'hsl(15 45% 65%)',
  'hsl(145 25% 70%)',
  'hsl(30 50% 70%)',
  'hsl(200 50% 60%)',
  'hsl(280 40% 65%)',
  'hsl(50 60% 60%)',
  'hsl(0 50% 65%)',
  'hsl(170 40% 55%)',
];

export default function History() {
  const { wearHistory, items } = useWardrobe();
  const [activeTab, setActiveTab] = useState('overview');
  const now = new Date();

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weeklyEvents = useMemo(
    () => wearHistory.filter((e) => isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })),
    [wearHistory, weekStart, weekEnd]
  );

  const monthlyEvents = useMemo(
    () => wearHistory.filter((e) => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })),
    [wearHistory, monthStart, monthEnd]
  );

  // Weekly bar chart data: count per item
  const weeklyChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    weeklyEvents.forEach((e) => {
      counts[e.itemName] = (counts[e.itemName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [weeklyEvents]);

  // Monthly pie chart data: by category
  const monthlyCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    monthlyEvents.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [monthlyEvents]);

  // Monthly top & least worn
  const monthlyItemCounts = useMemo(() => {
    const counts: Record<string, { name: string; count: number; category: string }> = {};
    monthlyEvents.forEach((e) => {
      if (!counts[e.itemId]) counts[e.itemId] = { name: e.itemName, count: 0, category: e.category };
      counts[e.itemId].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [monthlyEvents]);

  const topWorn = monthlyItemCounts.slice(0, 5);
  const leastWorn = [...monthlyItemCounts].sort((a, b) => a.count - b.count).slice(0, 5);

  // Average rating
  const avgRating = useMemo(() => {
    if (!wearHistory.length) return 0;
    return (wearHistory.reduce((sum, e) => sum + e.rating, 0) / wearHistory.length).toFixed(1);
  }, [wearHistory]);

  // Recent history table
  const recentHistory = useMemo(
    () => [...wearHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
    [wearHistory]
  );

  const chartConfig = {
    count: { label: 'Times Worn', color: 'hsl(15 45% 65%)' },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">Wardrobe History</h1>
          <p className="text-muted-foreground mt-1">Track your outfit patterns and make smarter fashion decisions</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Wears', value: wearHistory.length, icon: Clock, subtitle: 'All time' },
            { label: 'This Week', value: weeklyEvents.length, icon: BarChart3, subtitle: format(weekStart, 'MMM d') + ' – ' + format(weekEnd, 'MMM d') },
            { label: 'This Month', value: monthlyEvents.length, icon: PieChartIcon, subtitle: format(monthStart, 'MMMM yyyy') },
            { label: 'Avg Rating', value: avgRating, icon: Star, subtitle: 'Out of 5' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="mt-1 text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Weekly Analysis</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
            <TabsTrigger value="log">Wear Log</TabsTrigger>
          </TabsList>

          {/* Weekly */}
          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Items Worn This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={weeklyChartData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis type="number" allowDecimals={false} className="text-muted-foreground" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(15 45% 65%)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-10">No wear data this week</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Weekly Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Most Worn This Week</p>
                    {weeklyChartData.slice(0, 3).map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{i + 1}.</span>
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <Badge variant="secondary">{item.count}x</Badge>
                      </div>
                    ))}
                    {weeklyChartData.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                  </div>
                  <div className="glass-subtle p-4">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Try to rotate your outfits — wearing the same items too frequently can cause faster wear and tear.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Monthly */}
          <TabsContent value="monthly">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyCategoryData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={monthlyCategoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {monthlyCategoryData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-10">No wear data this month</p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      Most Worn (Monthly)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topWorn.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{i + 1}.</span>
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                          <Badge variant="secondary">{item.count}x</Badge>
                        </div>
                      </div>
                    ))}
                    {topWorn.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                      Least Worn (Monthly)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leastWorn.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">{i + 1}.</span>
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                          <Badge variant="destructive">{item.count}x</Badge>
                        </div>
                      </div>
                    ))}
                    {leastWorn.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Wear Log */}
          <TabsContent value="log">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Recent Wear Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Occasion</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentHistory.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.itemName}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{event.category}</Badge></TableCell>
                          <TableCell className="capitalize">{event.occasion}</TableCell>
                          <TableCell>{format(new Date(event.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <span className="text-primary font-medium">{'★'.repeat(event.rating)}{'☆'.repeat(5 - event.rating)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
