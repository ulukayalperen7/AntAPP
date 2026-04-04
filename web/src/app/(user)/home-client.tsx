'use client';
import "./_home-client.css"

const _cn28 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-5 _lh-f-lineHeigh112924 _textAlign-center ";
const _cn27 = "is_Text font_heading _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-600 _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px _textAlign-center ";
const _cn26 = "is_View _pos-relative _fd-column _ai-center _jc-center _paddingTop-t-space-10 _paddingRight-t-space-10 _paddingBottom-t-space-10 _paddingLeft-t-space-10 _gap-t-space-3 ";
const _cn25 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-260px _maw-33--337 ";
const _cn24 = "is_View _pos-relative _fd-row _fwr-wrap _gap-t-space-4 ";
const _cn23 = "is_Text font_body _col-primary _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 _cur-pointer ";
const _cn22 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px ";
const _cn21 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-center ";
const _cn20 = "is_View _pos-relative _fd-column _gap-t-space-3 ";
const _cn19 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-260px _maw-5037 ";
const _cn18 = "is_View _pos-relative _fd-row _fwr-wrap _gap-t-space-4 ";
const _cn17 = "is_Text font_body _col-primary _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 _cur-pointer ";
const _cn16 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px ";
const _cn15 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-center ";
const _cn14 = "is_View _pos-relative _fd-column _gap-t-space-3 ";
const _cn13 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn12 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn11 = "is_View _pos-relative _fd-column _h-300px _bg-muted _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _ai-center _jc-center _btw-2px _brw-2px _borderBottomWidth-2px _borderLeftWidth-2px _bts-dashed _brs-dashed _bbs-dashed _bls-dashed _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _gap-t-space-2 ";
const _cn10 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px ";
const _cn1 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-center ";
const _cn0 = "is_View _pos-relative _fd-column _gap-t-space-3 ";
const _cn9 = "is_View _pos-relative _fd-row _gap-t-space-2 _paddingTop-t-space-1 _paddingBottom-t-space-1 ";
const _cn8 = "is_Text font_body _col-ant200 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn7 = "is_Text font_heading _col-FFFFFF35 _ff-f-family _userSelect-text _fontWeight-700 _textAlign-left _fs-f-size-9 _lh-f-lineHeigh112928 _ls--0--4px ";
const _cn6 = "is_Text font_body _col-FFFFFF35 _ff-f-family _userSelect-text _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 _fontWeight-700 ";
const _cn5 = "is_View _pos-relative _fd-row _bg-primary _paddingRight-t-space-2--53 _paddingLeft-t-space-2--53 _paddingTop-t-space-1 _paddingBottom-t-space-1 _btlr-t-radius-2 _btrr-t-radius-2 _bbrr-t-radius-2 _bblr-t-radius-2 _alignSelf-flex-start ";
const _cn4 = "is_View _pos-relative _fd-column _gap-t-space-2 _maw-480px _zIndex-1 ";
const _cn3 = "is_View _fd-row _pos-absolute _top--40px _right--40px _w-200px _h-200px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _bg-ant800 _o-0--3 ";
const _cn2 = "is_View _fd-column _bg-ant900 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _paddingTop-t-space-6 _paddingRight-t-space-6 _paddingBottom-t-space-6 _paddingLeft-t-space-6 _mih-200px _jc-center _pos-relative _ox-hidden _oy-hidden ";
const _cn = "is_View _pos-relative _fd-column _gap-t-space-6 _flexGrow-1 _flexShrink-1 _fb-auto ";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, RouteCard, FilterChip, ScrollView } from '@antapp/ui';
import type { RouteCardData } from '@antapp/ui';
import type { RouteListItem, Tag } from '@/types/api';
import { Map } from 'lucide-react';
function routeToCardData(route: RouteListItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official'
  };
}
export default function HomeClient({
  popularRoutes,
  recommendedRoutes,
  tags
}: {
  popularRoutes: RouteListItem[];
  recommendedRoutes: RouteListItem[];
  tags: Tag[];
}) {
  const router = useRouter();
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const allTag = {
    id: '__all__',
    name: 'All',
    isActive: true
  };
  const tagList = [allTag, ...tags.filter(t => t.isActive)];
  const filterRoutes = (routes: RouteListItem[]) => {
    if (!activeTagId) return routes;
    return routes; // tag filtering is server-side; this is just UI state for now
  };
  return <div className={_cn}>
      {/* Hero Banner */}
      <div className={_cn2}>
        <div className={_cn3} />
        <div className={_cn4}>
          <div className={_cn5}>
            <span className={_cn6}>EXPLORE</span>
          </div>
          <span className={_cn7}>
            Discover Your Next Big Adventure
          </span>
          <span className={_cn8}>
            Join thousands of explorers sharing the best trails and hidden paths worldwide.
          </span>
        </div>
      </div>

      {/* Tag Filters */}
      {tagList.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <div className={_cn9}>
            {tagList.map(tag => <FilterChip key={tag.id} active={activeTagId === (tag.id === '__all__' ? null : tag.id)} onPress={() => setActiveTagId(tag.id === '__all__' ? null : tag.id)}>
                {tag.name}
              </FilterChip>)}
          </div>
        </ScrollView>}

      {/* Interactive Route Explorer */}
      <div className={_cn0}>
        <div className={_cn1}>
          <span className={_cn10}>Interactive Route Explorer</span>
        </div>
        <div className={_cn11}>
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <span className={_cn12}>Map — Coming Soon</span>
          <span className={_cn13}>Real-time trails and traffic around you</span>
        </div>
      </div>

      {/* Popular Routes */}
      {filterRoutes(popularRoutes).length > 0 && <div className={_cn14}>
          <div className={_cn15}>
            <span className={_cn16}>Popular Routes</span>
            <span className={_cn17} onClick={() => router.push('/search?sort=rating&type=official')}>
              View All
            </span>
          </div>
          <div className={_cn18}>
            {filterRoutes(popularRoutes).map(route => <div className={_cn19} key={route.id}>
                <RouteCard data={routeToCardData(route)} onPress={() => router.push(`/routes/${route.id}`)} />
              </div>)}
          </div>
        </div>}

      {/* Recommended / Community */}
      {filterRoutes(recommendedRoutes).length > 0 && <div className={_cn20}>
          <div className={_cn21}>
            <span className={_cn22}>Community Routes</span>
            <span className={_cn23} onClick={() => router.push('/search?sort=newest&type=community')}>
              See More
            </span>
          </div>
          <div className={_cn24}>
            {filterRoutes(recommendedRoutes).map(route => <div className={_cn25} key={route.id}>
                <RouteCard data={routeToCardData(route)} onPress={() => router.push(`/routes/${route.id}`)} />
              </div>)}
          </div>
        </div>}

      {/* Empty state when no routes */}
      {popularRoutes.length === 0 && recommendedRoutes.length === 0 && <div className={_cn26}>
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <span className={_cn27}>No routes yet</span>
          <span className={_cn28}>Be the first to create a route and share your adventure!</span>
        </div>}
    </div>;
}