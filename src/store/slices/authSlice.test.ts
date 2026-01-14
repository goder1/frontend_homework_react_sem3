//// src/store/slices/authSlice.test.ts
//import authReducer, {
//  loginUser,
//  logoutUser,
//  setUser,
//  AuthState,
//} from './authSlice';
//
//const initialState: AuthState = {
//  user: null,
//  isLoading: false,
//  error: null,
//  isAuthenticated: false,
//  isInitialized: false,
//};
//
//describe('authSlice', () => {
//  test('возвращает начальное состояние', () => {
//    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
//  });
//
//  test('setUser устанавливает пользователя', () => {
//    const user = { id: '1', email: 'test@test.com', username: 'testuser' };
//    const action = setUser(user);
//    const state = authReducer(initialState, action);
//    
//    expect(state.user).toEqual(user);
//    expect(state.isAuthenticated).toBe(true);
//  });
//
//  test('loginUser.pending устанавливает loading', () => {
//    const action = { type: loginUser.pending.type };
//    const state = authReducer(initialState, action);
//    
//    expect(state.isLoading).toBe(true);
//    expect(state.error).toBeNull();
//  });
//
//  test('loginUser.fulfilled устанавливает пользователя', () => {
//    const user = { id: '1', email: 'test@test.com', username: 'testuser' };
//    const action = { type: loginUser.fulfilled.type, payload: user };
//    const state = authReducer(initialState, action);
//    
//    expect(state.user).toEqual(user);
//    expect(state.isLoading).toBe(false);
//    expect(state.isAuthenticated).toBe(true);
//    expect(state.error).toBeNull();
//  });
//
//  test('logoutUser.fulfilled очищает состояние', () => {
//    const stateWithUser = {
//      ...initialState,
//      user: { id: '1', email: 'test@test.com' },
//      isAuthenticated: true,
//    };
//    
//    const action = { type: logoutUser.fulfilled.type };
//    const state = authReducer(stateWithUser, action);
//    
//    expect(state.user).toBeNull();
//    expect(state.isAuthenticated).toBe(false);
//  });
//});