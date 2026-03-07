import { defineComponent } from "vue";

const SizePresets: any = {
  xsmall: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 30,
};

interface SvgProps {
  size: string;
  viewBox?: string;
  style?: object;
}

export default defineComponent({
  name: "LeftArea",
  props: {
    size: {
      type: String,
      default: "large",
    },
    viewBox: {
      type: String,
      default: "0 0 1024 1024",
    },
    click: Function,
  },
  setup(props: SvgProps, { slots }) {
    let size = 12;
    if (SizePresets[props.size]) {
      size = SizePresets[props.size];
    }
    return () => {
      return (
        <svg aria-hidden="true" fill="currentColor" width={size} height={size} viewBox={props.viewBox}>
          {slots?.default?.()}
        </svg>
      );
    };
  },
});
