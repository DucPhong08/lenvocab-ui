export const colors = {
  background: '#F6F8F2',
  surface: '#FFFFFF',
  forest: '#194D40',
  deep: '#14392F',
  ink: '#203B34',
  muted: '#61746B',
  subtle: '#61746B',
  lime: '#D8F18D',
  pale: '#EAF2E5',
  line: '#DDE7DA',
  success: '#2D754F',
  error: '#BB4C3B',
  warning: '#946132',
};

export const shadow = {
  shadowColor: '#244534',
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 7 },
  elevation: 3,
} as const;

export const layout = {
  page: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
} as const;
