// project imports
import { useGetMenu } from 'api/menu';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

// type

const icons = { dashboard: DashboardOutlined, components: GoldOutlined, loading: LoadingOutlined };

const invoiceItem = { id: 'invoice1', title: 'invoice', type: 'item', url: '/dashboard/invoice', breadcrumbs: false };
const dataAnalyticsItem = { id: 'data-analytics1', title: '통계 데이터', type: 'item', url: '/dashboard/data-analytics', breadcrumbs: false };

const loadingMenu = {
  id: 'group-dashboard-loading',
  title: 'AI 데이터 분석',
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'dashboard1',
      title: 'AI 데이터 분석',
      type: 'collapse',
      icon: icons.loading,
      children: [
        dataAnalyticsItem,
        {
          id: 'default1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        invoiceItem
      ]
    }
  ]
};

const defaultMenu = {
  id: 'group-dashboard-loading',
  title: 'AI 데이터 분석',
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard1',
      title: 'AI 데이터 분석',
      type: 'collapse',
      icon: icons.dashboard,
      children: [dataAnalyticsItem, invoiceItem]
    }
  ]
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

  if (!childrenList?.length) return defaultMenu;

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
