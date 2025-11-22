import { GroupManager } from '../components/GroupManager';
import { useMemoContext } from '../context/MemoContext';

export const GroupsPage = () => {
    const { knownUsers } = useMemoContext();

    return (
        <GroupManager knownUsers={knownUsers} />
    );
};
