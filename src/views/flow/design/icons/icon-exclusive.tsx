import { defineComponent } from 'vue';

export const IconExclusive = defineComponent({
  name: 'IconExclusive',
  setup() {
    return () => {
      return <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none"
                  version="1.1" width="24" height="24" viewBox="0 0 24 24">
        <defs>
          <clipPath id="master_svg0_2_09646">
            <rect x="0" y="0" width="24" height="24" rx="0" />
          </clipPath>
        </defs>
        <g clip-path="url(#master_svg0_2_09646)">
          <path
            d="M20.939341,10.9393406L13.06066,3.0606602L12,2L10.9393396,3.0606602L3.0606602,10.9393396L2,12L3.0606600999999998,13.06066L12,22L13.06066,20.939341L20.939341,13.060659L22,12L20.939341,10.9393406ZM19.878679,12L12,4.1213204999999995L4.1213204999999995,12L12,19.878679L19.878679,12Z"
            fill-rule="evenodd" fill="#E6A23C" fill-opacity="1" />
          <g
            transform="matrix(0.7071067690849304,-0.7071067690849304,0.7071067690849304,0.7071067690849304,-6.420316019288293,8.499985494843713)">
            <rect x="10.05023193359375" y="12" width="1" height="7" rx="0" fill="#E6A23C" fill-opacity="1" />
            <rect x="7.05023193359375" y="16" width="1" height="7" rx="0" fill="#E6A23C" fill-opacity="1"
                  transform="matrix(0,-1,1,0,-8.94976806640625,23.05023193359375)" />
          </g>
        </g>
      </svg>;
    };
  },
});
