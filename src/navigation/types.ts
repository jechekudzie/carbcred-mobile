/** Route params, in one place so every navigator and screen agrees. */
export type AuthStackParamList = {
  Login: undefined;
};

/**
 * Tabs are not fixed: which of these exist depends on what the signed-in person
 * can do in the organisation they are working in. See MainTabNavigator.
 */
export type MainTabParamList = {
  Home: undefined;
  Projects: undefined;
  Engagements: undefined;
  Capture: undefined;
  Tasks: undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Emergency: undefined;
  Verify: undefined;
  Engagements: undefined;
};

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { slug: string; name: string };
};
