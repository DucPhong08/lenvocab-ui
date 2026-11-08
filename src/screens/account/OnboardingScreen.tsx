import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { sceneImage } from '@/theme/sceneImage';
import { useI18n } from '@/i18n';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

export function OnboardingScreen({ navigate }: ScreenProps) {
  const { styles } = useStyles();
  const { strings } = useI18n();
  const [step, setStep] = useState(0);

  const slides = [
    {
      image: 'desk',
      label: strings.onboarding.slide1Label,
      title: strings.onboarding.slide1Title,
      description: strings.onboarding.slide1Desc,
    },
    {
      image: 'kitchen',
      label: strings.onboarding.slide2Label,
      title: strings.onboarding.slide2Title,
      description: strings.onboarding.slide2Desc,
    },
    {
      image: 'library',
      label: strings.onboarding.slide3Label,
      title: strings.onboarding.slide3Title,
      description: strings.onboarding.slide3Desc,
    },
  ];

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
          <Text style={styles.skipText}>{strings.onboarding.skip}</Text>
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
          label={step === slides.length - 1 ? strings.onboarding.startExplore : strings.onboarding.next}
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
