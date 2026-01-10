import { useRoutes } from "react-router-dom";
import { routes } from "../../routes";
import { SidebarProvider } from "../../contexts/SidebarContext";

function AllRoutes() {
  const element = useRoutes(routes);
  return (
    <SidebarProvider>
      {element}
    </SidebarProvider>
  );
}

export default AllRoutes;
