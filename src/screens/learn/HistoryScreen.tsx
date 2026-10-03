import { Image, Pressable, Text, View } from 'react-native';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { SectionHeader } from '@/components/SectionHeader';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function HistoryScreen({ navigate, history, openHistory }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="NHỮNG GÌ BẠN ĐÃ THẤY"
        title="Hành trình khám phá."
        subtitle="Các lần quét trong phiên này. Lịch sử chưa được backend hỗ trợ lưu lâu dài."
      />
      <View style={styles.countCard}>
        <BookOpen size={22} color={colors.forest} />
        <Text style={styles.countText}>{history.length} lần quét</Text>
      </View>
      <SectionHeader kicker="GẦN ĐÂY" title="Lịch sử phiên này" />
      {history.length ? (
        history.map(entry => {
          const scene = getScene(entry.sceneId);
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={`Xem kết quả ${scene.title}`}
              onPress={() => openHistory(entry)}
              style={styles.historyRow}
            >
              <Image
                source={
                  entry.imageUri
                    ? { uri: entry.imageUri }
                    : sceneImage(scene.id)
                }
                style={styles.historyImage}
              />
              <View style={styles.fill}>
                <Text style={styles.historyDate}>
                  {new Date(entry.timestamp).toLocaleString('vi-VN', {
                    day: 'numeric',
                    month: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.historyTitle}>
                  {entry.imageUri ? 'Ảnh của bạn' : scene.title}
                </Text>
                <Text style={styles.historyCaption}>
                  {entry.result ? `Từ nhận diện: ${entry.result.keyword}` : `${scene.words.length} từ mẫu · ${scene.category}`}
                </Text>
              </View>
              <ArrowRight size={17} color={colors.muted} />
            </Pressable>
          );
        })
      ) : (
        <EmptyState
          title="Chưa có lần quét nào"
          description="Chọn ảnh hoặc một cảnh mẫu để bắt đầu khám phá."
          onPress={() => navigate('camera')}
          action="Bắt đầu khám phá"
        />
      )}
      {history.length > 0 && (
        <PrimaryButton
          label="Khám phá thêm"
          onPress={() => navigate('camera')}
          style={styles.actionTop18}
        />
      )}
    </View>
  );
}
