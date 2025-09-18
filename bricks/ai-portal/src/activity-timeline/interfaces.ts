export interface ActivityBase {
  user_id: string;
  user_name: string;
  time: number;
  action_type:
    | "create_goal"
    | "edit_goal"
    | "delete_goal"
    | "decompose_goals"
    | "alter_owner"
    | "alter_user"
    | "add_comment"
    | "start_conversation";
  metadata: unknown;
}

export type Activity =
  | ActivityOfCreateGoal
  | ActivityOfEditGoal
  | ActivityOfDeleteGoal
  | ActivityOfDecomposeGoals
  | ActivityOfAlterOwner
  | ActivityOfAlterUser
  | ActivityOfAddComment
  | ActivityOfStartConversation;

export interface ActivityOfCreateGoal extends ActivityBase {
  action_type: "create_goal";
  metadata: {
    goal_title: string;
    goal_description?: string;
  };
}

export interface ActivityOfEditGoal extends ActivityBase {
  action_type: "edit_goal";
  metadata: {
    before: {
      title: string;
      description: string;
    };
    after: {
      title: string;
      description: string;
    };
  };
}

export interface ActivityOfDeleteGoal extends ActivityBase {
  action_type: "delete_goal";
  metadata: {
    goal_title: string;
    goal_description?: string;
  };
}

export interface ActivityOfDecomposeGoals extends ActivityBase {
  action_type: "decompose_goals";
  metadata: {
    sub_goals_count: number;
    sub_goals: Array<{
      sub_goal_id: string;
      title: string;
    }>;
  };
}

export interface ActivityOfAlterOwner extends ActivityBase {
  action_type: "alter_owner";
  metadata: {
    before: {
      user_id: string;
      user_name: string;
    };
    after: {
      user_id: string;
      user_name: string;
    };
  };
}

export interface ActivityOfAlterUser extends ActivityBase {
  action_type: "alter_user";
  metadata: {
    before: Array<{
      user_id: string;
      user_name: string;
    }>;
    after: Array<{
      user_id: string;
      user_name: string;
    }>;
  };
}

export interface ActivityOfAddComment extends ActivityBase {
  action_type: "add_comment";
  metadata: {
    comment_content: string;
  };
}

export interface ActivityOfStartConversation extends ActivityBase {
  action_type: "start_conversation";
  metadata: {
    conversation_id: string;
    conversation_title: string;
    conversation_description?: string;
  };
}
