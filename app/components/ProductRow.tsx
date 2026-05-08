// app/components/ProductRow.tsx
// Single editable row in the admin product table.
// Per instructions: "app/components/ProductRow.js ← single editable row in admin table"

import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Product } from '../store/useStore';

export const COL_WIDTHS = {
  name: 110,
  brand: 80,
  qty: 44,
  cat: 70,
  price: 64,
  specs: 96,
  actions: 56,
};

interface ProductRowProps {
  product: Product;
  onUpdate: (updates: Partial<Omit<Product, 'id'>>) => void;
  onDelete: () => void;
}

export default function ProductRow({ product, onUpdate, onDelete }: ProductRowProps) {
  // Per instructions: "Each row has: Edit | Delete buttons"
  // Edit toggles between view-only and inline-edit mode.
  const [editing, setEditing] = useState(false);

  if (!editing) {
    // View mode — tapping Edit enters edit mode
    return (
      <View style={[styles.row, product.isEnriching && styles.rowEnriching]}>
        <Text style={[styles.cell, styles.colName, styles.viewText]} numberOfLines={1}>
          {product.name || '—'}
        </Text>
        <Text style={[styles.cell, styles.colBrand, styles.viewText]} numberOfLines={1}>
          {product.brand || '—'}
        </Text>
        <Text style={[styles.cell, styles.colQty, styles.viewText, { textAlign: 'center' }]}>
          {product.quantity}
        </Text>
        <Text style={[styles.cell, styles.colCat, styles.viewText]} numberOfLines={1}>
          {product.category}
        </Text>

        {/* Price cell — spinner while enriching */}
        <View style={[styles.cell, styles.colPrice, { justifyContent: 'center' }]}>
          {product.isEnriching ? (
            <ActivityIndicator size="small" color="#00c97a" />
          ) : (
            <Text style={styles.viewText} numberOfLines={1}>
              {product.price || '—'}
            </Text>
          )}
        </View>

        {/* Specs cell — spinner while enriching */}
        <View style={[styles.cell, styles.colSpecs, { justifyContent: 'center' }]}>
          {product.isEnriching ? (
            <ActivityIndicator size="small" color="#00c97a" />
          ) : (
            <Text style={[styles.viewText, { fontSize: 11 }]} numberOfLines={1}>
              {product.specs || '—'}
            </Text>
          )}
        </View>

        {/* Actions: Edit | Delete */}
        <View style={[styles.cell, styles.colActions, styles.actionsRow]}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={styles.editBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Edit mode — all cells are inline-editable
  return (
    <View style={[styles.row, styles.rowEditing]}>
      <TextInput
        style={[styles.cell, styles.colName, styles.input]}
        value={product.name}
        placeholder="Name"
        placeholderTextColor="#555"
        onChangeText={(v) => onUpdate({ name: v })}
        autoFocus
      />
      <TextInput
        style={[styles.cell, styles.colBrand, styles.input]}
        value={product.brand}
        placeholder="Brand"
        placeholderTextColor="#555"
        onChangeText={(v) => onUpdate({ brand: v })}
      />
      <TextInput
        style={[styles.cell, styles.colQty, styles.input, { textAlign: 'center' }]}
        value={product.quantity}
        placeholder="1"
        placeholderTextColor="#555"
        keyboardType="numeric"
        onChangeText={(v) => onUpdate({ quantity: v })}
      />
      <TextInput
        style={[styles.cell, styles.colCat, styles.input]}
        value={product.category}
        placeholder="other"
        placeholderTextColor="#555"
        onChangeText={(v) => onUpdate({ category: v })}
      />
      <TextInput
        style={[styles.cell, styles.colPrice, styles.input]}
        value={product.price}
        placeholder="₹—"
        placeholderTextColor="#555"
        keyboardType="decimal-pad"
        onChangeText={(v) => onUpdate({ price: v })}
      />
      <TextInput
        style={[styles.cell, styles.colSpecs, styles.input]}
        value={product.specs}
        placeholder="—"
        placeholderTextColor="#555"
        onChangeText={(v) => onUpdate({ specs: v })}
      />

      {/* Actions: Done | Delete */}
      <View style={[styles.cell, styles.colActions, styles.actionsRow]}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => setEditing(false)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.doneBtnText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1c1c1c',
    backgroundColor: '#111',
  },
  rowEnriching: { backgroundColor: '#0d1a12' },
  rowEditing: { backgroundColor: '#0f1520' },

  cell: { flexDirection: 'row', alignItems: 'center' },
  colName: { width: COL_WIDTHS.name },
  colBrand: { width: COL_WIDTHS.brand },
  colQty: { width: COL_WIDTHS.qty },
  colCat: { width: COL_WIDTHS.cat },
  colPrice: { width: COL_WIDTHS.price },
  colSpecs: { width: COL_WIDTHS.specs, flexShrink: 1 },
  colActions: { width: COL_WIDTHS.actions },

  viewText: {
    color: '#ccc',
    fontSize: 12,
    paddingHorizontal: 4,
  },
  input: {
    color: '#f0f0f0',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#2a4a7a',
    borderRadius: 6,
    backgroundColor: '#0d1520',
    marginRight: 4,
    flex: 1,
  },

  actionsRow: {
    gap: 5,
    justifyContent: 'flex-end',
  },
  editBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: { color: '#4a9eff', fontSize: 13, fontWeight: '700' },
  doneBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0b2e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: { color: '#00c97a', fontSize: 13, fontWeight: '800' },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1e0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#e53935', fontSize: 11, fontWeight: '700' },
});
