import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Box, DetectedObject } from '@/api/contracts';
import { colors } from '@/theme/theme';

export function containRect(
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
) {
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const w = imageWidth * scale;
  const h = imageHeight * scale;
  return { left: (width - w) / 2, top: (height - h) / 2, width: w, height: h };
}

export function CropPreview({ uri, box }: { uri: string; box: Box }) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let active = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (active) setSize({ width: w, height: h });
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [uri]);
  const height = Math.min(
    170,
    (width * (size.height * box.height)) / (size.width * box.width),
  );
  const frame = containRect(
    width || 1,
    height || 1,
    size.width * box.width,
    size.height * box.height,
  );
  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[css.crop, { height: height || 170 }]}
    >
      {!!width && (
        <View
          testID="crop-window"
          style={[
            css.cropWindow,
            {
              left: frame.left,
              top: frame.top,
              width: frame.width,
              height: frame.height,
            },
          ]}
        >
          <Image
            source={{ uri }}
            accessibilityLabel="Vùng vật thể đã chọn"
            style={[
              css.absoluteImage,
              {
                width: frame.width / box.width,
                height: frame.height / box.height,
                left: -(box.left * frame.width) / box.width,
                top: -(box.top * frame.height) / box.height,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

export function ObjectPicker({
  uri,
  objects,
  selectedId,
  busy,
  onSelect,
}: {
  uri: string;
  objects: DetectedObject[];
  selectedId?: string | null;
  busy: boolean;
  onSelect: (item: DetectedObject) => void;
}) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [width, setWidth] = useState(0);
  const rect = containRect(width || 1, 290, size.width, size.height);
  const choices = objects.filter(
    item => item.bounding_box && item.selection_token,
  );
  return (
    <View>
      <View
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
        style={css.scene}
      >
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          accessibilityLabel="Ảnh gốc, chạm một khung để chọn vật"
          onLoad={event => setSize(event.nativeEvent.source)}
        />
        {choices.map((item, index) => {
          const box = item.bounding_box!;
          const active = item.object_id === selectedId;
          return (
            <Pressable
              key={item.object_id}
              accessibilityRole="button"
              accessibilityLabel={`Chọn ${item.keyword}, vật ${index + 1}`}
              accessibilityState={{ selected: active, disabled: busy }}
              disabled={busy}
              onPress={() => onSelect(item)}
              style={[
                css.box,
                active && css.selected,
                {
                  left: rect.left + box.left * rect.width,
                  top: rect.top + box.top * rect.height,
                  width: box.width * rect.width,
                  height: box.height * rect.height,
                },
              ]}
            >
              <Text style={[css.number, active && css.activeNumber]}>
                {index + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={css.hint}>
        {busy
          ? 'Đang xử lý vật đã chọn...'
          : 'Chạm vào khung hoặc tên vật bên dưới'}
      </Text>
      <View style={css.choices}>
        {choices.map((item, index) => (
          <Pressable
            key={item.object_id}
            accessibilityRole="button"
            accessibilityLabel={`Chọn từ ${item.keyword}, vật ${index + 1}`}
            accessibilityState={{
              selected: selectedId === item.object_id,
              disabled: busy,
            }}
            disabled={busy}
            onPress={() => onSelect(item)}
            style={[css.chip, selectedId === item.object_id && css.activeChip]}
          >
            <Text
              style={[
                css.chipText,
                selectedId === item.object_id && css.activeText,
              ]}
            >
              {index + 1}. {item.keyword}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const css = StyleSheet.create({
  cropWindow: { position: 'absolute', overflow: 'hidden' },
  absoluteImage: { position: 'absolute' },
  scene: {
    height: 290,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.pale,
  },
  box: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'white',
    borderRadius: 7,
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.lime,
    backgroundColor: '#d7f59022',
  },
  number: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: colors.forest,
    paddingHorizontal: 5,
    fontWeight: '800',
    borderRadius: 4,
    fontSize: 11,
  },
  activeNumber: { backgroundColor: colors.lime },
  hint: { color: colors.muted, fontSize: 12, marginTop: 10, marginBottom: 9 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  activeChip: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.forest, fontWeight: '700', fontSize: 12 },
  activeText: { color: 'white' },
  crop: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.pale,
    marginVertical: 12,
  },
});
