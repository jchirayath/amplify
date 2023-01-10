// pages
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

// other
import {FC} from "react";

// interface
interface Route {
    key: string,
    title: string,
    path: string,
    enabled: boolean,
    component: FC<{}>
}

export const routes: Array<Route> = [
    {
        key: 'dashboard-route',
        title: 'Home',
        path: '/',
        enabled: true,
        component: Dashboard
    },
    {
        key: 'signin-route',
        title: 'Sign In',
        path: '/signin',
        enabled: true,
        component: SignIn
    },
    {
        key: 'signup-route',
        title: 'Sign Up',
        path: '/signup',
        enabled: true,
        component: SignUp
    }
]