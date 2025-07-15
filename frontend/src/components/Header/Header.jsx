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
      style={{
        marginBottom: '32px',
        background: backgroundGradient,
        color: titleColor,
        borderRadius: 0,
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <Text size="xl" weight={700} style={{ color: titleColor, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <div style={{ minWidth: '300px', flex: 1, maxWidth: '400px' }}>
            <Text size="sm" weight={500} style={{ color: titleColor, marginBottom: '12px' }}>
              🎯 Dağılım
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {stats.map((stat, i) => (
                <Text key={i} size="xs" style={{ color: statLabelColor }}>
                  {stat.label}: {stat.value} {stat.percentage !== undefined ? `(${stat.percentage}%)` : ""}
                </Text>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {stats.map((stat, i) =>
                stat.percentage > 0 ? (
                  <div
                    key={i}
                    style={{
                      flex: stat.percentage,
                      backgroundColor: stat.barColor || "gray",
                      height: '8px',
                      borderRadius: '4px'
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
