import { WarningFilledIcon } from "./Icons";
import Modal from "./Modal";
import useErrorStore from "@/store/errorStore";

export default function ErrorModal() {
  const { isOpen, title, message, closeError } = useErrorStore();

  return (
    <Modal
      icon={WarningFilledIcon}
      isOpen={isOpen}
      title={title}
      buttons={[
        {
          label: "확인",
          onClick: closeError,
        },
      ]}
      onClose={closeError}
    >
      {message}
    </Modal>
  );
}
