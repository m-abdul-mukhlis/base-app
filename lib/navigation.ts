let resolver: ((value: any) => void) | null = null;

export function navigateWithResult(router: any, pathname: string, params?: Record<string, any>): Promise<any> {
  return new Promise((resolve) => {
    resolver = resolve;
    router.push({
      pathname,
      params,
    });
  });
}

export function resolveNavigationResult(data: any) {
  if (resolver) {
    resolver(data);
    resolver = null;
  }
}
