
type NewChatButtonProps = {
    onClick: () => void;
  };
  
  function NewChatButton({ onClick }: NewChatButtonProps) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        <span>New chat</span>
      </button>
    );
  }
  
  export default NewChatButton;
  