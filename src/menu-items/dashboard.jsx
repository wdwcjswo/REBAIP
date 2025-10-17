// project imports
import { useGetMenu } from 'api/menu.jsx';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

// type
const icons = { dashboard: DashboardOutlined, components: GoldOutlined, loading: LoadingOutlined };

const dataAnalyticsItem = { id: 'data-analytics', title: '통계 데이터', type: 'collapse', icon: 'components', url: '/dashboard/data-analytics', breadcrumbs: false };

const loadingMenu = {
  id: 'group-dashboard-loading',
  title: 'AI 데이터 분석',
  type: 'group',
  icon: icons.loading,
  children: [dataAnalyticsItem]
};


// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();

  if (menuLoading) return loadingMenu;

  const subChildrenList = (children) => {
    return children?.map((subList) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList) => {
    const list = fillItem(subList);

    // if collapsible item, we need to feel its children as well
    if (subList.type === 'collapse') {
      list.children = subChildrenList(subList.children);
    }
    return list;
  };

  const childrenList = menu?.children?.map((subList) => {
    return itemList(subList);
  });

  const menuList = fillItem(menu, childrenList);
  return menuList;
}

function fillItem(item, children) {
  return {
    ...item,
    title: item?.title === 'dashboard' ? 'AI 데이터 분석' : item?.title,
    icon: item?.icon ? icons[item.icon] : undefined,
    ...(children && { children })
  };
}
