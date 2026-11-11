import { ActionTypes, UPDATE_USER_DATA } from "../actions/actions";

export interface IAccount {
  userDataLoading: boolean;
  userData?: {
    displayName: string;
    profilePicture?: string;
  };
}

export function account(
  state: IAccount = { userDataLoading: true },
  action: ActionTypes
) {
  switch (action.type) {
    case UPDATE_USER_DATA: {
      return {
        ...state,
        ...action.payload,
        userDataLoading: false,
      };
    }

    default:
      return state;
  }
}
