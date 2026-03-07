import { defineComponent } from "vue";
import SvgIcon from "./svg-icon";

export const IconFlowBranch = defineComponent({
  name: "IconFlowBranch",
  setup() {
    return () => {
      return (
        <SvgIcon>
          <path
            d="M512 0l512 512-512 512-512-512 512-512z m0 80.497778L80.497778 512 512 943.502222 943.502222 512 512 80.497778z"
            fill="currentColor"
            p-id="25633"
          >
          </path>
        </SvgIcon>
      );
    };
  },
});
