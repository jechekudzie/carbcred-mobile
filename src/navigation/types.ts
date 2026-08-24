/** Route params, in one place so every navigator and screen agrees. */
export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Projects: undefined;
  Capture: undefined;
  Tasks: undefined;
  More: undefined;
};

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { slug: string; name: string };
};
