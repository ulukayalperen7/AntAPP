'use client';
import "./_spots-client.css"

const _cn24 = "is_View _pos-relative _fd-row _fwr-wrap _gap-t-space-4 ";
const _cn23 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn22 = "is_View _pos-relative _fd-row _gap-t-space-2 _ai-center ";
const _cn21 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn20 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px ";
const _cn19 = "is_View _pos-relative _fd-column _gap-t-space-1 ";
const _cn18 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-center _fwr-wrap _gap-t-space-3 ";
const _cn17 = "is_View _pos-relative _fd-column _gap-t-space-4 ";
const _cn16 = "is_View _pos-relative _fd-column _bg-backgroundS110634794 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _bbs-solid _bts-solid _bls-solid _brs-solid ";
const _cn15 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-280px ";
const _cn14 = "is_View _pos-relative _fd-row _gap-t-space-3 _fwr-wrap _ai-center ";
const _cn13 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn12 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-700 _textAlign-left _fs-f-size-9 _lh-f-lineHeigh112928 _ls--0--4px ";
const _cn11 = "is_Text font_body _col-primary _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn10 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-2 ";
const _cn1 = "is_View _pos-relative _fd-column _gap-t-space-2 _maw-760px ";
const _cn0 = "is_View _pos-relative _fd-column _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _bg-backgroundS110634794 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _paddingTop-t-space-5 _paddingRight-t-space-5 _paddingBottom-t-space-5 _paddingLeft-t-space-5 _gap-t-space-4 _bbs-solid _bts-solid _bls-solid _brs-solid ";
const _cn9 = "is_View _pos-relative _fd-column _gap-t-space-5 _flexGrow-1 _flexShrink-1 _fb-auto ";
const _cn8 = "is_View _pos-relative _fd-row _gap-t-space-2 _fwr-wrap ";
const _cn7 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 _WebkitLineClamp-2 _WebkitBoxOrient-vertical _dsp--webkit-box _ox-hidden _oy-hidden ";
const _cn6 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-7 _lh-f-lineHeigh112926 _ls--0--2px ";
const _cn5 = "is_View _pos-relative _fd-column _gap-t-space-1 _flexGrow-1 _flexShrink-1 _fb-auto ";
const _cn4 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-flex-start _gap-t-space-2 ";
const _cn3 = "is_View _pos-relative _fd-column _paddingTop-t-space-4 _paddingRight-t-space-4 _paddingBottom-t-space-4 _paddingLeft-t-space-4 _gap-t-space-3 _flexGrow-1 _flexShrink-1 _fb-auto ";
const _cn2 = "is_View _pos-relative _fd-column _h-180px _bg-muted _jc-center _ai-center ";
const _cn = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-260px _maw-33--337 _bg-backgroundS110634794 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _ox-hidden _oy-hidden _cur-pointer _bbs-solid _bts-solid _bls-solid _brs-solid _btc-0hover-primary _brc-0hover-primary _borderBottomColor-0hover-primary _borderLeftColor-0hover-primary _o-0hover-0--96 _tr-0active-scale0--9851281 ";
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, SearchInput, Button, Badge, Image } from '@antapp/ui';
import type { SpotListItem } from '@/types/api';
import { getSpots } from '@/features/spots/actions';
import { EmptyState } from '@/components/empty-state';
import { Compass, MapPinned, Search, Star } from 'lucide-react';
function SpotCard({
  spot,
  onPress
}: {
  spot: SpotListItem;
  onPress: () => void;
}) {
  return <div className={_cn} onClick={onPress}>
      <div className={_cn2}>
        {spot.photoUrl ? <Image source={{
        uri: spot.photoUrl
      }} width="100%" height="100%" objectFit="cover" /> : <MapPinned size={36} color="var(--color-mutedForeground)" />}
      </div>

      <div className={_cn3}>
        <div className={_cn4}>
          <div className={_cn5}>
            <span className={_cn6}>{spot.name}</span>
            <span className={_cn7}>
              {spot.description ?? 'No description yet.'}
            </span>
          </div>
          {spot.averageRating > 0 && <Badge variant="info" size="sm">{spot.averageRating.toFixed(1)}</Badge>}
        </div>

        <div className={_cn8}>
          <Badge variant="default" size="sm">Lat {spot.latitude.toFixed(3)}</Badge>
          <Badge variant="default" size="sm">Lng {spot.longitude.toFixed(3)}</Badge>
          {spot.averageRating > 0 && <Badge variant="default" size="sm">Rated</Badge>}
        </div>

        <Button variant="outline" size="sm" onPress={onPress}>
          View Spot
        </Button>
      </div>
    </div>;
}
export default function SpotsClient({
  initialSpots,
  initialTotal
}: {
  initialSpots: SpotListItem[];
  initialTotal: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [spots, setSpots] = useState(initialSpots);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();
  const fetchSpots = useCallback((search: string) => {
    startTransition(async () => {
      try {
        const result = await getSpots({
          search: search.trim() || undefined,
          page: 1,
          pageSize: 24
        });
        setSpots(result.data);
        setTotal(result.totalRecords);
      } catch {
        setSpots([]);
        setTotal(0);
      }
    });
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchSpots(query);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [fetchSpots, query]);
  return <div className={_cn9}>
      <div className={_cn0}>
        <div className={_cn1}>
          <div className={_cn10}>
            <Compass size={18} color="var(--color-primary)" />
            <span className={_cn11}>SPOTS DIRECTORY</span>
          </div>
          <span className={_cn12}>Discover destinations before you build a route</span>
          <span className={_cn13}>
            Browse places added to the platform, inspect their ratings, and jump into the routes that already include them.
          </span>
        </div>

        <div className={_cn14}>
          <div className={_cn15}>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search spots by name or description..." icon={<Search size={18} color="var(--color-mutedForeground)" />} />
          </div>
          <Badge variant="info" size="md">{isPending ? 'Searching...' : `${total} spots`}</Badge>
        </div>
      </div>

      {spots.length === 0 && !isPending ? <div className={_cn16}>
          <EmptyState Icon={MapPinned} title="No spots found" description="Try a different search term or come back later as the directory grows." />
        </div> : <div className={_cn17}>
          <div className={_cn18}>
            <div className={_cn19}>
              <span className={_cn20}>All spots</span>
              <span className={_cn21}>
                {isPending ? 'Refreshing results...' : `${spots.length} visible cards`}
              </span>
            </div>
            <div className={_cn22}>
              <Star size={16} color="var(--color-primary)" />
              <span className={_cn23}>Open a spot to see routes and rating details</span>
            </div>
          </div>

          <div className={_cn24}>
            {spots.map(spot => <SpotCard key={spot.id} spot={spot} onPress={() => router.push(`/spots/${spot.id}`)} />)}
          </div>
        </div>}
    </div>;
}