// app/components/TemplateCard.tsx
// Template picker card used in OnboardingScreen.
// Each card shows a visual preview of a storefront template.

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type TemplateType = 'grid' | 'list' | 'dark';

interface TemplateCardProps {
  template: TemplateType;
  selected: boolean;
  onSelect: (template: TemplateType) => void;
}

const TEMPLATE_META: Record<TemplateType, { label: string; description: string; accent: string; bg: string; textColor: string }> = {
  grid: {
    label: 'Grid',
    description: 'Clean 3-column product cards on white',
    accent: '#22c55e',
    bg: '#ffffff',
    textColor: '#111',
  },
  list: {
    label: 'List',
    description: 'Full-width rows with rich product details',
    accent: '#3b82f6',
    bg: '#f5f5f5',
    textColor: '#111',
  },
  dark: {
    label: 'Dark',
    description: 'Neon green accents on deep black',
    accent: '#00ff88',
    bg: '#0a0a0a',
    textColor: '#fff',
  },
};

export default function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  const meta = TEMPLATE_META[template];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: selected ? meta.accent : '#333' },
        selected && styles.cardSelected,
      ]}
      onPress={() => onSelect(template)}
      activeOpacity={0.8}
    >
      {/* Mini preview */}
      <View style={[styles.preview, { backgroundColor: meta.bg }]}>
        {template === 'grid' ? (
          <View style={styles.gridPreview}>
            {[0,1,2,3,4,5].map((i) => (
              <View key={i} style={[styles.gridCell, { borderColor: '#e5e5e5' }]}>
                <View style={[styles.gridCellImg, { backgroundColor: '#e8e8e8' }]} />
                <View style={[styles.gridCellLine, { backgroundColor: '#d0d0d0' }]} />
                <View style={[styles.gridCellPrice, { backgroundColor: meta.accent + '66' }]} />
              </View>
            ))}
          </View>
        ) : template === 'list' ? (
          <View style={styles.listPreview}>
            {[0,1,2].map((i) => (
              <View key={i} style={[styles.listRow, { borderBottomColor: '#ddd' }]}>
                <View style={[styles.listImg, { backgroundColor: '#e0e0e0' }]} />
                <View style={styles.listText}>
                  <View style={[styles.listLine, { backgroundColor: '#bbb', width: '70%' }]} />
                  <View style={[styles.listLine, { backgroundColor: '#ddd', width: '50%' }]} />
                  <View style={[styles.listPrice, { backgroundColor: meta.accent + '66' }]} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.gridPreview, { backgroundColor: '#0a0a0a' }]}>
            {[0,1,2,3,4,5].map((i) => (
              <View key={i} style={[styles.gridCell, { borderColor: '#222' }]}>
                <View style={[styles.gridCellImg, { backgroundColor: '#1a1a1a' }]} />
                <View style={[styles.gridCellLine, { backgroundColor: '#333' }]} />
                <View style={[styles.gridCellPrice, { backgroundColor: '#00ff8844' }]} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Label */}
      <View style={styles.labelRow}>
        <View>
          <Text style={styles.labelTitle}>{meta.label}</Text>
          <Text style={styles.labelDesc}>{meta.description}</Text>
        </View>
        {selected && (
          <View style={[styles.checkCircle, { backgroundColor: meta.accent }]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161616',
    marginBottom: 14,
  },
  cardSelected: {
    backgroundColor: '#0f1a0f',
  },
  preview: {
    height: 120,
    padding: 8,
  },
  gridPreview: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridCell: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    gap: 2,
  },
  gridCellImg: {
    height: 24,
    borderRadius: 3,
  },
  gridCellLine: {
    height: 5,
    borderRadius: 2,
  },
  gridCellPrice: {
    height: 5,
    borderRadius: 2,
    width: '60%',
  },
  listPreview: {
    flex: 1,
    gap: 4,
  },
  listRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  listImg: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  listText: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  listLine: {
    height: 4,
    borderRadius: 2,
  },
  listPrice: {
    height: 4,
    borderRadius: 2,
    width: '30%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  labelTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  labelDesc: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
