import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { sceneImage } from '@/theme/sceneImage';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

const slides = [
  {
    image: 'desk',
    label: '01 / KHÁM PHÁ',
    title: 'Học từ chính thế giới quanh bạn.',
    description:
      'Một góc bàn, một tấm biển hay một trang sách đều có thể trở thành bài học.',
  },
  {
    image: 'kitchen',
    label: '02 / GHI NHỚ',
    title: 'Nhìn thấy. Hiểu rõ. Nhớ lâu.',
    description: 'Học từ vựng cùng hình ảnh, ví dụ và cách dùng gần gũi.',
  },
  {
    image: 'library',
    label: '03 / TIẾN BỘ',
    title: 'Một chút mỗi ngày, giỏi hơn mỗi ngày.',
    description: 'Lưu từ yêu thích, ôn bằng flashcard và thử sức với quiz.',
  },
];
export function OnboardingScreen({ navigate }: ScreenProps) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  return (
    <View style={styles.page}>
      <View style={styles.onboardTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigate('home')}
          style={styles.skip}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </Pressable>
      </View>
      <Image
        source={sceneImage(slide.image)}
        style={styles.onboardImage}
        accessibilityLabel="Cảnh đời thường để học từ vựng"
      />
      <View style={styles.onboardText}>
        <Eyebrow>{slide.label}</Eyebrow>
        <Text style={styles.onboardTitle}>{slide.title}</Text>
        <Text style={styles.onboardDescription}>{slide.description}</Text>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Trang giới thiệu ${index + 1}`}
              accessibilityState={{ selected: index === step }}
              onPress={() => setStep(index)}
              style={[styles.dot, index === step && styles.activeDot]}
            />
          ))}
        </View>
        <PrimaryButton
          label={step === slides.length - 1 ? 'Khám phá bản demo' : 'Tiếp tục'}
          onPress={() =>
            step === slides.length - 1
              ? navigate('home')
              : setStep(value => value + 1)
          }
        />
      </View>
    </View>
  );
}
