
let colors = {
  black: '#0C131E',
  transparent: 'transparent',
  inherit: 'inherit',
  white: '#FFFFFF',
  neutral: {
    '900': '#1B263A',
    '850': '#223049',
    '800': '#364359',
    '750': '#4A556A',
    '700': '#5E687A',
    '650': '#697282',
    '600': '#7A8291',
    '550': '#8D95A5',
    '500': '#9AA2B2',
    '450': '#B8BEC9',
    '400': '#CCD3DD',
    '350': '#DBE0E7',
    '300': '#E5E7EE',
    '250': '#ECEEF3',
    '200': '#F3F5F9',
  },
  green: {
    '900': '#3E7F4D',
    '800': '#479258',
    '700': '#50A463',
    '600': '#59B66E',
    '500': '#7AC58B',
    '400': '#9BD3A8',
    '300': '#BDE2C5',
    '200': '#DEF0E2',
    '100': '#EEF8F1',
  },
  orange: {
    '900': '#9F5314',
    '800': '#B65E16',
    '700': '#CC6A19',
    '600': '#E3761C',
    '500': '#E99149',
    '400': '#EEAD77',
    '300': '#F4C8A4',
    '200': '#F9E4D2',
    '100': '#FCF1E8'
  },
  yellow: {
    '900': '#A1850B',
    '800': '#B8980C',
    '700': '#CFAB0E',
    '600': '#E6BE0F',
    '500': '#EBCB3F',
    '400': '#F0D86F',
    '300': '#F5E59F',
    '200': '#FAF2CF',
    '100': '#FDF9E7',
  },
  red: {
    '900': '#952A22',
    '800': '#AA3026',
    '700': '#C0362B',
    '600': '#D53C30',
    '500': '#DD6359',
    '400': '#E68A83',
    '300': '#EEB1AC',
    '200': '#F7D8D6',
    '100': '#FBECEA',
  },
  purple: {
    '900': '#514192',
    '800': '#5C4AA6',
    '700': '#6854BB',
    '600': '#735DD0',
    '500': '#8F7DD9',
    '400': '#AB9EE3',
    '300': '#C7BEEC',
    '200': '#E3DFF6',
    '100': '#F1EFFA'
  },
  cyan: {
    '900': '#29768D',
    '800': '#2E87A2',
    '700': '#3498B6',
    '600': '#3AA9CA',
    '500': '#61BAD5',
    '400': '#89CBDF',
    '300': '#B0DDEA',
    '200': '#D8EEF4',
    '100': '#EBF6FA',
  },
  blue: {
    '900': '#0062B3',
    '800': '#0070CC',
    '700': '#007EE6',
    '600': '#008CFF',
    '500': '#33A3FF',
    '400': '#66BAFF',
    '300': '#99D1FF',
    '200': '#CCE8FF',
    '100': '#E6F4FF',
  },
  teal: {
    '900': '#19675F',
    '800': '#1D766C',
    '700': '#20847A',
    '600': '#249387',
    '500': '#50A99F',
    '400': '#7CBEB7',
    '300': '#A7D4CF',
    '200': '#D3E9E7',
    '100': '#E9F4F3',
  },
  pink: {
    '900': '#832358',
    '800': '#962864',
    '700': '#A82D71',
    '600': '#BB327D',
    '500': '#C95B97',
    '400': '#D684B1',
    '300': '#E4ADCB',
    '200': '#F1D6E5',
    '100': '#F8EBF2', 
  },
  brown: {
    '900': '#7F4133',
    '800': '#924A3A', 
    '700': '#A45442', 
    '600': '#B65D49', 
    '500': '#C57D6D', 
    '400': '#D39E92',
    '300': '#E2BEB6',
    '200': '#F0DFDB', 
    '100': '#F8EFED',
  },
  indigo: {
    '900': '#2F3976',
    '800': '#364286',
    '700': '#3C4A97',
    '600': '#4352A8',
    '500': '#6975B9',
    '400': '#8E97CB',
    '300': '#B4BADC',
    '200': '#D9DCEE', 
    '100': '#ECEEF6',
  },
  lime: {
    '900': '#577D2E',
    '800': '#638F35',
    '700': '#70A13B',
    '600': '#7CB342',
    '500': '#96C268',
    '400': '#B0D18E',
    '300': '#CBE1B3',
    '200': '#E5F0D9',
    '100': '#F2F7EC',
  },
  maroon: {
    '900': '#4F2B3F',
    '800': '#5A3248',
    '700': '#663851',
    '600': '#713E5A',
    '500': '#8D657B',
    '400': '#AA8B9C',
    '300': '#C6B2BD',
    '200': '#E3D8DE',
    '100': '#F1ECEF',
  },
  sapphire: {
    '900': '#3E6682',
    '800': '#4F83A7',
    '700': '#4F83A7',
    '600': '#5891BA',
    '500': '#79A7C8',
    '400': '#9BBDD6',
    '300': '#BCD3E3',
    '200': '#DEE9F1',
    '100': '#EEF4F8',
  },
  rose: {
    '900': '#89374A',
    '800': '#9D3F55',
    '700': '#B0475F',
    '600': '#C44F6A',
    '500': '#D07288',
    '400': '#DC95A6',
    '300': '#E7B9C3',
    '200': '#F3DCE1',
    '100': '#F9EDF0'
  }
}

module.exports = {
  prefix: 'cx-',
  important: false,
  separator: ':',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    },
    colors,
    spacing: {
      px: '1px',
      '0': '0',
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
      '40': '10rem',
      '48': '12rem',
      '56': '14rem',
      '64': '16rem'
    },
    backgroundColor: theme => theme('colors'),
    backgroundPosition: {
      bottom: 'bottom',
      center: 'center',
      left: 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      right: 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      top: 'top'
    },
    backgroundSize: {
      auto: 'auto',
      cover: 'cover',
      contain: 'contain'
    },
    borderColor: theme => ({
      ...theme('colors'),
      default: theme('colors.grey-light', 'currentColor')
    }),
    borderRadius: {
      none: '0',
      default: '2px',
      medium: '3px',
      full: '9999px'
    },
    borderWidth: {
      default: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '8': '8px'
    },
    boxShadow: {
      default: '0 5px 10px 0 rgba(28, 46, 72,0.17)',
      md: '0 4px 8px 0 rgba(28, 46, 72,0.10), 0 2px 4px 0 rgba(28, 46, 72,0.08)',
      lg: '0 15px 30px 0 rgba(28, 46, 72,0.10), 0 5px 15px 0 rgba(28, 46, 72,0.08)',
      inner: 'inset 0 2px 4px 0 rgba(28, 46, 72,0.06)',
      none: 'none'
    },
    container: {},
    cursor: {
      auto: 'auto',
      default: 'default',
      pointer: 'pointer',
      wait: 'wait',
      text: 'text',
      move: 'move',
      'not-allowed': 'not-allowed'
    },
    fill: {
      current: 'currentColor'
    },
    flex: {
      '1': '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      none: 'none'
    },
    flexGrow: {
      '0': '0',
      default: '1'
    },
    flexShrink: {
      '0': '0',
      default: '1'
    },
    fontFamily: {
      sans: ['sofiapro', 'system-ui', 'BlinkMacSystemFont', '-apple-system', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: ['Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace']
    },
    fontSize: {
      xxs: '.75rem', // 12px
      xs: '.812rem', // 13px
      sm: '.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem' // 36px
    },
    fontWeight: {
      hairline: '100',
      thin: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    height: theme => ({
      auto: 'auto',
      ...theme('spacing'),
      full: '100%',
      screen: '100vh'
    }),
    inset: {
      '0': '0',
      auto: 'auto'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal'
    },
    margin: (theme, { negative }) => ({
      auto: 'auto',
      ...theme('spacing'),
      ...negative(theme('spacing'))
    }),
    maxHeight: {
      full: '100%',
      screen: '100vh'
    },
    maxWidth: {
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      full: '100%'
    },
    minHeight: {
      '0': '0',
      full: '100%',
      screen: '100vh'
    },
    minWidth: {
      '0': '0',
      full: '100%'
    },
    objectPosition: {
      bottom: 'bottom',
      center: 'center',
      left: 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      right: 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      top: 'top'
    },
    opacity: {
      '0': '0',
      '25': '0.25',
      '50': '0.5',
      '75': '0.75',
      '100': '1'
    },
    order: {
      first: '-9999',
      last: '9999',
      none: '0',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12'
    },
    padding: theme => theme('spacing'),
    placeholderColor: theme => theme('colors'),
    stroke: {
      current: 'currentColor'
    },
    textColor: theme => ({
      ...theme('colors'),
      default: theme('colors.navy')
    }),
    width: theme => ({
      auto: 'auto',
      ...theme('spacing'),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      '1/5': '20%',
      '2/5': '40%',
      '3/5': '60%',
      '4/5': '80%',
      '1/6': '16.666667%',
      '2/6': '33.333333%',
      '3/6': '50%',
      '4/6': '66.666667%',
      '5/6': '83.333333%',
      '1/12': '8.333333%',
      '2/12': '16.666667%',
      '3/12': '25%',
      '4/12': '33.333333%',
      '5/12': '41.666667%',
      '6/12': '50%',
      '7/12': '58.333333%',
      '8/12': '66.666667%',
      '9/12': '75%',
      '10/12': '83.333333%',
      '11/12': '91.666667%',
      full: '100%',
      screen: '100vw'
    }),
    zIndex: {
      auto: 'auto',
      '0': '0',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
      '99999': '99999'
    }
  },
  variants: {
    accessibility: [],
    alignContent: [],
    alignItems: [],
    alignSelf: [],
    appearance: false,
    backgroundAttachment: false,
    backgroundColor: ['hover', 'focus'],
    backgroundPosition: [],
    backgroundRepeat: [],
    backgroundSize: [],
    borderCollapse: [],
    borderColor: ['hover', 'focus'],
    borderRadius: [],
    borderStyle: ['hover', 'focus'],
    borderWidth: ['hover', 'focus'],
    boxShadow: ['hover', 'focus'],
    cursor: ['hover'],
    display: ['group-hover'],
    fill: ['group-hover'],
    flex: [],
    flexDirection: [],
    flexGrow: [],
    flexShrink: [],
    flexWrap: [],
    float: [],
    fontFamily: [],
    fontSize: [],
    fontWeight: ['hover'],
    fontSmoothing: [],
    fontStyle: ['hover', 'focus'],
    height: ['responsive'],
    inset: [],
    justifyContent: [],
    letterSpacing: [],
    lineHeight: [],
    listStylePosition: [],
    listStyleType: [],
    margin: ['hover'],
    maxHeight: [],
    maxWidth: [],
    minHeight: [],
    minWidth: [],
    objectFit: false,
    objectPosition: false,
    opacity: ['hover'],
    order: [],
    outline: ['focus'],
    overflow: [],
    padding: [],
    placeholderColor: [],
    pointerEvents: [],
    position: [],
    resize: [],
    stroke: [],
    tableLayout: [],
    textAlign: [],
    textColor: ['hover', 'focus', 'group-hover'],
    textDecoration: [],
    textTransform: [],
    userSelect: [],
    verticalAlign: [],
    visibility: ['group-hover', 'hover'],
    whitespace: [],
    width: [],
    wordBreak: [],
    zIndex: []
  },
  corePlugins: {},
  plugins: [
    function({ addUtilities }) {
      const utils = {
        '.break-word': {
          wordBreak: 'break-word'
        },
        '.overflow-y-overlay': {
          'overflow-y': 'overlay'
        },
        '.overflow-x-overlay': {
          'overflow-x': 'overlay'
        }
      }
      addUtilities(utils)
    }
  ]
}
