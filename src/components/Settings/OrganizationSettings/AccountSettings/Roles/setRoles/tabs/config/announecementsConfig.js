export const announcementCards = [
  {
    title: "Announcement post",
    fields: [
      {
        name: "announcement.announcementPost",
        label: "Announcement post",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "announcement.deletePost",
        label: "Delete post",
        type: "toggle",
      },
    ],
  },
  {
    title: "Announcement comment",
    fields: [
      {
        name: "announcement.deleteComment",
        label: "Delete comment",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
    ],
  },
  {
    title: "Announcement settings",
    fields: [
      {
        name: "announcement.editSettings",
        label: "Edit announcement settings",
        type: "toggle",
      },
      {
        name: "announcement.viewSettings",
        label: "View announcement settings",
        type: "toggle",
      },
      {
        name: "announcement.moderatePostComment",
        label: "Moderate post and comment",
        type: "toggle",
      },
    ],
  },
];
