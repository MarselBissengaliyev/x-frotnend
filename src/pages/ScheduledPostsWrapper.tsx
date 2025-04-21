import { useParams } from 'react-router-dom';
import ScheduledPosts from '../components/ScheduledPosts';

const ScheduledPostsWrapper = () => {
  const { accountId } = useParams<{ accountId: string }>();
  if (!accountId) return <div>Account ID не найден</div>;

  return <ScheduledPosts accountId={accountId} />;
};

export default ScheduledPostsWrapper;
