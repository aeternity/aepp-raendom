import Router from 'vue-router'
import TipsList from "./views/TipsList";
import TipCommentsView from "./views/TipCommentsView";
import UserProfileView from "./views/UserProfileView";
import Terms from './views/Terms';
import Privacy from './views/Privacy';
import Mission from './views/Mission';
import CreateProfile from './views/CreateProfile';
import LoadingView from "./views/LoadingView";

let guardTipComments = (to, from, next) => {
  if(to.name == 'tip' && typeof to.params.id !== "undefined"){
    next();
  }else{
    next('/');
  }
}


const routes = [
  {
    path: '/tips',
    name: 'home',
    component: TipsList,
    meta: {title: 'Home'}
  },
  {
    path: '/tip/:id',
    name: 'tip',
    component: TipCommentsView,
    meta: {
      title: 'Comments for a Tip'
    },
    props: true,
    beforeEnter : guardTipComments,
  },
  {
    path: '/user-profile/:address',
    name: 'user-profile',
    component: UserProfileView,
    meta: {
      title: 'User Profile'
    },
    props: true
  },
  {
    path: '/',
    name: 'loading',
    component: LoadingView,
    meta: {
      title: 'Loading'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: {
      title: 'Terms of service'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
    meta: {
      title: 'Privacy policy'
    }
  },
  {
    path: '/mission',
    name: 'mission',
    component: Mission,
    meta: {
      title: 'Mission'
    }
  },
  {
    path: '/create-profile',
    name: 'create-profile',
    component: CreateProfile,
    meta: {
      title: 'Create Profile'
    }
  },
]

const router = new Router({mode: 'hash', routes: routes})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - Social sharing with a mission`
  next()
})

export default router;
