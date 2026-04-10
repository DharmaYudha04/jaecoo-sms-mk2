import { useLocation, useOutlet } from 'react-router-dom';

export function RouteTransitionOutlet({
  className = '',
  routeKey,
}: {
  className?: string;
  routeKey?: string;
}) {
  const location = useLocation();
  const outlet = useOutlet();
  const resolvedRouteKey = routeKey ?? `${location.pathname}${location.search}${location.hash}`;

  return (
    <div
      key={resolvedRouteKey}
      className={[className, 'route-transition-shell', 'route-transition-enter'].join(' ').trim()}
      data-route-key={resolvedRouteKey}
    >
      {outlet}
    </div>
  );
}
