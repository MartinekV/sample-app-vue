import Cookies from 'universal-cookie';
import {
  selectedProjectCookieName,
  defaultProjectId,
} from './Utilities/SelectedProject';
import packageInfo from '../package.json';
import validator from 'validator';

// Kontent.ai
import {
  camelCasePropertyNameResolver,
  DeliveryClient,
} from '@kontent-ai/delivery-sdk';

const sourceTrackingHeaderName = 'X-KC-SOURCE';

const cookies = new Cookies(document.cookie);

const previewApiKey = import.meta.env.VITE_VUE_APP_PREVIEW_API_KEY || '';

const getProjectIdFromEnvironment = (): string | null | undefined => {
  const projectIdFromEnv = import.meta.env.VITE_VUE_APP_PROJECT_ID;

  if (projectIdFromEnv === undefined) {
    return undefined;
  }

  if (projectIdFromEnv && !validator.isUUID(projectIdFromEnv)) {
    console.error(
      `Your projectId (${projectIdFromEnv}) given in your environment variables is not a valid GUID.`
    );
    return null;
  }

  return projectIdFromEnv;
};

const getProjectIdFromCookies = (): string | null => {
  const projectIdFromCookie = cookies.get(selectedProjectCookieName);

  if (projectIdFromCookie && !validator.isUUID(projectIdFromCookie)) {
    console.error(
      `Your projectId (${projectIdFromCookie}) from cookies is not a valid GUID.`
    );
    return null;
  }

  return projectIdFromCookie;
};

const currentProjectId =
  getProjectIdFromEnvironment() ?? getProjectIdFromCookies() ?? '';

const isPreview = () => previewApiKey !== '';

let Client = new DeliveryClient({
  projectId: currentProjectId,
  propertyNameResolver: camelCasePropertyNameResolver,
  previewApiKey: previewApiKey,
  defaultQueryConfig: {
    usePreviewMode: isPreview(),
  },
  globalHeaders: () => [
    {
      header: sourceTrackingHeaderName,
      value: `${packageInfo.name};${packageInfo.version}`,
    },
  ],
});

const resetClient = (newProjectId: string) => {
  Client = new DeliveryClient({
    projectId: newProjectId,
    propertyNameResolver: camelCasePropertyNameResolver,
    previewApiKey: previewApiKey,
    defaultQueryConfig: {
      usePreviewMode: isPreview(),
    },
    globalHeaders: () => [
      {
        header: sourceTrackingHeaderName,
        value: `${packageInfo.name};${packageInfo.version}`,
      },
    ],
  });
  const cookies = new Cookies(document.cookie);
  cookies.set(selectedProjectCookieName, newProjectId, { path: '/', sameSite: 'none', secure: true });
};

export { Client, resetClient, getProjectIdFromEnvironment, getProjectIdFromCookies };
