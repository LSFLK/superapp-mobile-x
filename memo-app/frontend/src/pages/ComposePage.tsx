// Note: We are not using react-router yet, but mimicking navigation via props/context in App.tsx. 
// Actually, we are still using state-based routing in App.tsx for now as per plan.
// So this component will just wrap MemoForm and handle success.

import { MemoForm } from '../components/MemoForm';
import { useMemoContext } from '../context/MemoContext';


interface ComposePageProps {
    onSuccess: () => void;
}

export const ComposePage = ({ onSuccess }: ComposePageProps) => {
    const { sendMemo, knownUsers } = useMemoContext();

    return (
        <MemoForm
            onSuccess={onSuccess}
            onSubmit={sendMemo}
            knownUsers={knownUsers}
        />
    );
};
