import React from "react";
import { Card, Text } from "@mantine/core";

const Header = ({
  title,
  subtitle,
  icon: Icon,
  stats = [], // [{ label, value, percentage, color, barColor }]
  style = {},
  backgroundGradient = "linear-gradient(135deg,  #24809c 0%, #112d3b 100%)",
  titleColor = "white",
  subtitleColor = "rgba(255,255,255,0.8)",
  statLabelColor = "rgba(255,255,255,0.9)"
}) => {
  return (
    <Card
      shadow="lg"
      className="mb-8 rounded-none"
      style={{
        background: backgroundGradient,
        color: titleColor,
        ...style
      }}
    >
      <div className="flex justify-between items-center flex-wrap gap-6">
        <div>
          <Text size="xl" weight={700} className="mb-2 flex items-center gap-2" style={{ color: titleColor }}>
            {Icon && <Icon size={20} />}
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" style={{ color: subtitleColor }}>
              {subtitle}
            </Text>
          )}
          {stats.length > 0 && (
            <Text size="xs" style={{ color: statLabelColor, marginTop: '4px' }}>
              {`📊 Toplam ${stats.reduce((acc, s) => acc + (s.value || 0), 0)} öğe`}
            </Text>
          )}
        </div>

        {stats.length > 0 && (
          <div className="min-w-[300px] flex-1 max-w-[400px]">
            <Text size="sm" weight={500} style={{ color: titleColor, marginBottom: '12px' }}>
              🎯 Dağılım
            </Text>
            <div className="flex justify-between mb-2">
              {stats.map((stat, i) => (
                <Text key={i} size="xs" style={{ color: statLabelColor }}>
                  {stat.label}: {stat.value} {stat.percentage !== undefined ? `(${stat.percentage}%)` : ""}
                </Text>
              ))}
            </div>
            <div className="flex gap-px">
              {stats.map((stat, i) =>
                stat.percentage > 0 ? (
                  <div
                    key={i}
                    className="h-2 rounded"
                    style={{
                      flex: stat.percentage,
                      backgroundColor: stat.barColor || "gray"
                    }}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Header;
