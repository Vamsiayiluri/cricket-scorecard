import { useEffect, useMemo, useRef, useState } from "react";
import { subscribeToQuery } from "../../services/firebase/firestoreHelpers";
import { buildNotificationsQuery } from "../../services/firebase/notificationService";

const EMPTY = [];

const useNotifications = (uid) => {
  const [notifications, setNotifications] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const queryRef = useRef(null);

  useEffect(() => {
    if (!uid) {
      setNotifications(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    queryRef.current = buildNotificationsQuery(uid, 50);

    const unsub = subscribeToQuery(
      queryRef.current,
      (docs) => {
        setNotifications(docs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return { notifications, unreadCount, loading };
};

export default useNotifications;
