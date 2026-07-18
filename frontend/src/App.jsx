import MainLayout from "./components/layout/MainLayout";
import Terminal from "./components/terminal/Terminal";
import useAutoScroll from "./hooks/useAutoScroll";
import useBackendHealth from "./hooks/useBackendHealth";
import useChat from "./hooks/useChat";
import useTerminalCursor from "./hooks/useTerminalCursor";

export default function App() {

    const { status, backendReady } =
        useBackendHealth();

    const {
        history,
        input,
        setInput,
        thinking,
        sendCommand
    } = useChat(backendReady);

    const {
        endRef,
        scrollToBottom,
    } = useAutoScroll(history, thinking);

    const {
        inputRef,
        cursorRef,
        mirrorRef
    } = useTerminalCursor(input);

    return (
        <MainLayout>
            <Terminal
                history={history}
                thinking={thinking}
                endRef={endRef}
                scrollToBottom={scrollToBottom}

                input={input}
                setInput={setInput}
                onSubmit={sendCommand}

                inputRef={inputRef}
                cursorRef={cursorRef}
                mirrorRef={mirrorRef}

                backendReady={backendReady}
                status={status}
            />
        </MainLayout>
    );
}