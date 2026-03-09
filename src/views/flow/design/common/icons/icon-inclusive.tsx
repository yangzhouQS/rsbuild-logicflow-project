import { defineComponent } from 'vue';
import SvgIcon from './svg-icon.tsx';

export const IconInclusive = defineComponent({
  name: 'IconInclusive',
  setup() {
    return () => {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
             width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_9_03481">
              <rect x="0" y="0" width="24" height="24" rx="0" />
            </clipPath>
          </defs>
          <g clip-path="url(#master_svg0_9_03481)">
            <path
              d="M20.939341,10.9393406L13.06066,3.0606602L12,2L10.9393396,3.0606602L3.0606602,10.9393396L2,12L3.0606600999999998,13.06066L12,22L13.06066,20.939341L20.939341,13.060659L22,12L20.939341,10.9393406ZM19.878679,12L12,4.1213204999999995L4.1213204999999995,12L12,19.878679L19.878679,12Z"
              fill-rule="evenodd" fill="#E6A23C" fill-opacity="1" />
            <ellipse cx="12" cy="12" rx="3.25" ry="3.25" fill-opacity="0" stroke-opacity="1" stroke="#E6A23C"
                     fill="none" stroke-width="1.5" />
          </g>
        </svg>
      );
    };
  },
});
