import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Menu, Text } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';
import { chromaticNotes, type SongKey, type SongMetadata, type SongScale } from '@/modules/song-content';
import { transposeNote } from '@/modules/transpose';

const PaperText = cssInterop(Text, { className: 'style' });

type SongMetadataBarProps = {
  metadata: SongMetadata;
  onChangeMetadata: (metadata: SongMetadata) => void;
  transposeSemitones: number;
  onChangeTranspose: (value: number) => void;
};

const scaleLabels: Record<SongScale, string> = { major: 'Mayor', minor: 'Menor' };

// Optional per-song facts (key, scale) plus a session-only transpose control — none of this is
// required to write or read a song, it just sits below the title when there's something to show.
// Table-like: each fact is its own row, icon + label in a fixed-width first column so every row's
// actual control (select, +/- buttons) starts at the same x.
export function SongMetadataBar({
  metadata,
  onChangeMetadata,
  transposeSemitones,
  onChangeTranspose,
}: SongMetadataBarProps) {
  const [keyMenuOpen, setKeyMenuOpen] = useState(false);
  const [scaleMenuOpen, setScaleMenuOpen] = useState(false);
  const effectiveKey = metadata.key ? transposeNote(metadata.key, transposeSemitones) : null;

  return (
    <View className="gap-3">
      <MetadataRow icon="music-note" label="Tono">
        <DropdownTrigger
          value={metadata.key}
          placeholder="—"
          visible={keyMenuOpen}
          onRequestOpen={() => setKeyMenuOpen(true)}
          onDismiss={() => setKeyMenuOpen(false)}>
          {chromaticNotes.map((note) => (
            <Menu.Item
              key={note}
              title={note}
              onPress={() => {
                onChangeMetadata({ ...metadata, key: note });
                setKeyMenuOpen(false);
              }}
            />
          ))}
          <Menu.Item
            title="Sin definir"
            onPress={() => {
              onChangeMetadata({ ...metadata, key: null });
              setKeyMenuOpen(false);
            }}
          />
        </DropdownTrigger>
      </MetadataRow>

      <MetadataRow icon="linear-scale" label="Escala">
        <DropdownTrigger
          value={metadata.scale ? scaleLabels[metadata.scale] : null}
          placeholder="—"
          visible={scaleMenuOpen}
          onRequestOpen={() => setScaleMenuOpen(true)}
          onDismiss={() => setScaleMenuOpen(false)}>
          {(Object.keys(scaleLabels) as SongScale[]).map((scale) => (
            <Menu.Item
              key={scale}
              title={scaleLabels[scale]}
              onPress={() => {
                onChangeMetadata({ ...metadata, scale });
                setScaleMenuOpen(false);
              }}
            />
          ))}
          <Menu.Item
            title="Sin definir"
            onPress={() => {
              onChangeMetadata({ ...metadata, scale: null });
              setScaleMenuOpen(false);
            }}
          />
        </DropdownTrigger>
      </MetadataRow>

      <MetadataRow icon="swap-vert" label="Transportar">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => onChangeTranspose(transposeSemitones - 1)}
            className="h-10 w-10 items-center justify-center rounded-[8px] hover:bg-[#ece2d2] active:bg-[#ece2d2]">
            <PaperText className="text-xl font-bold text-[#674124]">-</PaperText>
          </Pressable>
          <PaperText className="min-w-[110px] text-center text-[13px] text-[#756b5f]">
            {transposeSemitones === 0
              ? 'Original'
              : `${transposeSemitones > 0 ? '+' : ''}${transposeSemitones} semitonos`}
            {effectiveKey ? ` (${effectiveKey})` : ''}
          </PaperText>
          <Pressable
            onPress={() => onChangeTranspose(transposeSemitones + 1)}
            className="h-10 w-10 items-center justify-center rounded-[8px] hover:bg-[#ece2d2] active:bg-[#ece2d2]">
            <PaperText className="text-xl font-bold text-[#674124]">+</PaperText>
          </Pressable>
          {transposeSemitones !== 0 ? (
            <Pressable onPress={() => onChangeTranspose(0)} className="rounded-[8px] px-2 py-1.5">
              <PaperText className="text-[13px] font-bold text-[#8f5f38]">Reset</PaperText>
            </Pressable>
          ) : null}
        </View>
      </MetadataRow>
    </View>
  );
}

type MetadataRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  children: React.ReactNode;
};

// Fixed-width icon+label column, like a table's first column, so whatever control follows (a select,
// a row of buttons) always starts at the same x regardless of how long each row's label is.
function MetadataRow({ icon, label, children }: MetadataRowProps) {
  return (
    <View className="flex-row items-center">
      <View className="w-[140px] flex-row items-center gap-1.5">
        <MaterialIcons name={icon} size={16} color={workspaceTheme.colors.accentDark} />
        <PaperText className="text-[13px] font-bold uppercase tracking-[0.6px] text-[#9d9285]">{label}</PaperText>
      </View>
      {children}
    </View>
  );
}

type DropdownTriggerProps = {
  value: SongKey | string | null;
  placeholder: string;
  visible: boolean;
  onRequestOpen: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
};

// The actual select box + its react-native-paper Menu — used for both Tono and Escala.
function DropdownTrigger({ value, placeholder, visible, onRequestOpen, onDismiss, children }: DropdownTriggerProps) {
  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={
        <Pressable
          onPress={onRequestOpen}
          // Matches the width of the -/value/+ group below it: 40 (minus) + 12 (gap) + 110 (value,
          // its own min-width) + 12 (gap) + 40 (plus) = 214px — so both controls read as the same size.
          className="h-10 w-[214px] flex-row items-center rounded-[8px] border border-[#ded0bd] bg-[#fffdf8] px-2">
          {/* Spacer the same width as the arrow, so the text centers on the box instead of on the
              space left over after the arrow — the arrow itself stays pinned to the right edge. */}
          <View className="w-[18px]" />
          <View className="flex-1 items-center">
            <PaperText className="text-[13px] font-bold text-[#674124]">{value ?? placeholder}</PaperText>
          </View>
          <MaterialIcons name="arrow-drop-down" size={18} color={workspaceTheme.colors.accentDark} />
        </Pressable>
      }>
      {children}
    </Menu>
  );
}
