import React from 'react';
import { Card, Text, Progress } from "@mantine/core";

const Header = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  userName, 
  totalCount, 
  stats, 
  showStats = false,
  statsTitle = "İstatistikler",
  gradient = 'linear-gradient(135deg, #24809c 0%, #112d3b 100%)'
}) => {
  const StatusBar = ({ stats, size = "md", showLabels = true }) => (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text size="xs" className="text-[#6c757d]">Başlamadı: {stats.notStarted}%</Text>
          <Text size="xs" className="text-[#fd7e14]">Devam: {stats.inProgress}%</Text>
          <Text size="xs" className="text-[#28a745]">Tamamlandı: {stats.completed}%</Text>
          <Text size="xs" className="text-[#dc3545]">İptal: {stats.cancelled}%</Text>
        </div>
      )}
      <div className="flex gap-0.5">
        {stats.notStarted > 0 && (
          <div style={{ flex: stats.notStarted }}>
            <Progress value={100} color="#6c757d" size={size} />
          </div>
        )}
        {stats.inProgress > 0 && (
          <div style={{ flex: stats.inProgress }}>
            <Progress value={100} color="#fd7e14" size={size} />
          </div>
        )}
        {stats.completed > 0 && (
          <div style={{ flex: stats.completed }}>
            <Progress value={100} color="#28a745" size={size} />
          </div>
        )}
        {stats.cancelled > 0 && (
          <div style={{ flex: stats.cancelled }}>
            <Progress value={100} color="#dc3545" size={size} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card
      shadow="lg"
      className="mb-8 text-white rounded-none h-28"
      style={{ background: gradient }}
    >
      <div className="flex justify-between items-center flex-wrap gap-6">
        <div>
          <Text size="xl" weight={700} className="text-white mb-2">
            {Icon && <Icon size={20} style={{ marginRight: 8, display: 'inline' }} />}
            {title}
          </Text>
          <Text size="sm" className="text-white text-opacity-80">
            {userName && `${userName} - `}{subtitle}
          </Text>
          {totalCount !== undefined && (
            <Text size="xs" className="text-white text-opacity-70 mt-1">
              📊 Toplam {totalCount} kayıt
            </Text>
          )}
        </div>
        
        {showStats && stats && (
          <div className="min-w-[300px] flex-1 max-w-[400px]">
            <Text size="sm" weight={500} className="text-white mb-3">
              🎯 {statsTitle}
            </Text>
            <StatusBar stats={stats} size="lg" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Header;