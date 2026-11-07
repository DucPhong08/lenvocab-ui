import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { sceneImage } from '@/theme/sceneImage';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

const slides = [
  {
    image: 'desk',
    label: 'Chụp một vật',
    title: 'Học từ chính thế giới quanh bạn.',
    description:
      'Chụp một vật quen thuộc, chọn vật trong ảnh và xem nghĩa cùng cách phát âm.',
  },
  {
    image: 'kitchen',
    label: 'Giữ lại từ',
    title: 'Nhìn thấy. Hiểu rõ. Nhớ lâu.',
    description:
      'Khám phá từ và cụm A2–B2 qua cảnh mẫu, câu ví dụ và cách dùng.',
  },
  {
    image: 'library',
    label: 'Dùng từ linh hoạt',
    title: 'Một chút mỗi ngày, giỏi hơn mỗi ngày.',
    description: 'Lưu từ yêu thích, ôn bằng flashcard và thử sức với quiz.',
  },
];
export function OnboardingScreen({ navigate }: ScreenProps) {
  const { styles } = useStyles();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  return (
    <>
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
              style={styles.dotTarget}
            >
              <View style={[styles.dot, index === step && styles.activeDot]} />
            </Pressable>
          ))}
        </View>
        <PrimaryButton
          label={step === slides.length - 1 ? 'Bắt đầu khám phá' : 'Tiếp tục'}
          onPress={() =>
            step === slides.length - 1
              ? navigate('home')
              : setStep(value => value + 1)
          }
        />
      </View>
    </>
  );
}
