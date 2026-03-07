import { defineComponent } from 'vue';

export const IconExclusiveRender = defineComponent({
  name: 'IconExclusiveRender',
  setup() {
    return () => {
      return <div class={'gateway-node-container'}>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
             width="98" height="98" viewBox="0 0 60 60">
          <path
            d="M58.585789,28.585789L31.414215,1.4142134L30.000002,0L28.585789,1.4142133L1.4142134,28.585789L0,30.000002L1.4142135,31.414215L28.585789,58.585789L30.000002,60.000004L31.414215,58.585789L58.585789,31.414215L60.000004,30.000002L58.585789,28.585789ZM57.171577,30.000002L30.000002,2.8284268L2.8284268,30.000002L30.000002,57.171577L57.171577,30.000002Z"
            fill-rule="evenodd" fill="#E6A23C" fill-opacity="1" />
          <g
            transform="matrix(0.7071067690849304,-0.7071067690849304,0.7071067690849304,0.7071067690849304,-16.750184446576895,20.19319022408672)">
            <rect x="25.293566703796387" y="30.31548740933067" width="1.659571647644043" height="20.541837692260742"
                  rx="0" fill="#E6A23C" fill-opacity="1" />
            <rect x="16.000244140625" y="40.76920413970947" width="1.624617338180542" height="20.245296478271484" rx="0"
                  fill="#E6A23C" fill-opacity="1" transform="matrix(0,-1,1,0,-24.768959999084473,56.76944828033447)" />
          </g>
        </svg>
      </div>
    };
  },
});
