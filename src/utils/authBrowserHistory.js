// A history marker is only for displaying a completed page.
// It never grants authentication permissions.

export function markCompletedAuthPage(pathname, stage) {
  const current = window.history.state || {};

  window.history.replaceState(
    {
      ...current,
      usr: {
        ...(current.usr || {}),
        completedAuthPage: pathname,
        completedAuthStage: stage,
      },
    },
    ""
  );
}