import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScannerIconProps {
  size?: number;
}

export function ScannerIcon({ size = 140 }: ScannerIconProps) {
  const outerBorderColor = '#B2FFB2'; // Soft light green/cyan border from mockup
  const cornerColor = '#FFFFFF';      // White camera corner brackets
  const centerColor = '#D4E2FC';      // Light blue-gray central rounded square

  const cornerSize = Math.max(16, size * 0.16);
  const borderWidth = Math.max(2, size * 0.025);
  const borderRadius = Math.max(4, size * 0.05);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Square Border */}
      <View
        style={[
          styles.outerBorder,
          {
            borderColor: outerBorderColor,
            borderWidth: borderWidth,
            borderRadius: borderRadius,
          },
        ]}
      />

      {/* Top-Left Corner Bracket */}
      <View
        style={[
          styles.corner,
          {
            top: size * 0.12,
            left: size * 0.12,
            width: cornerSize,
            height: cornerSize,
            borderLeftWidth: borderWidth,
            borderTopWidth: borderWidth,
            borderColor: cornerColor,
          },
        ]}
      />

      {/* Top-Right Corner Bracket */}
      <View
        style={[
          styles.corner,
          {
            top: size * 0.12,
            right: size * 0.12,
            width: cornerSize,
            height: cornerSize,
            borderRightWidth: borderWidth,
            borderTopWidth: borderWidth,
            borderColor: cornerColor,
          },
        ]}
      />

      {/* Bottom-Left Corner Bracket */}
      <View
        style={[
          styles.corner,
          {
            bottom: size * 0.12,
            left: size * 0.12,
            width: cornerSize,
            height: cornerSize,
            borderLeftWidth: borderWidth,
            borderBottomWidth: borderWidth,
            borderColor: cornerColor,
          },
        ]}
      />

      {/* Bottom-Right Corner Bracket */}
      <View
        style={[
          styles.corner,
          {
            bottom: size * 0.12,
            right: size * 0.12,
            width: cornerSize,
            height: cornerSize,
            borderRightWidth: borderWidth,
            borderBottomWidth: borderWidth,
            borderColor: cornerColor,
          },
        ]}
      />

      {/* Center Rounded Square Indicator */}
      <View
        style={[
          styles.centerSquare,
          {
            backgroundColor: centerColor,
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: size * 0.08,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerBorder: {
    ...StyleSheet.absoluteFill,
  },
  corner: {
    position: 'absolute',
  },
  centerSquare: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
