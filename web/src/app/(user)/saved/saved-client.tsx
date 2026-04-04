'use client';
import "./_saved-client.css"

const _cn18 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn17 = "is_Text font_body _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-4 _lh-f-lineHeigh112923 ";
const _cn16 = "is_View _pos-relative _fd-row _w-48px _h-48px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _bg-muted _ai-center _jc-center ";
const _cn15 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-240px _maw-33--337 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _btw-2px _brw-2px _borderBottomWidth-2px _borderLeftWidth-2px _bts-dashed _brs-dashed _bbs-dashed _bls-dashed _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _ai-center _jc-center _mih-200px _cur-pointer _gap-t-space-2 _btc-0hover-primary _brc-0hover-primary _borderBottomColor-0hover-primary _borderLeftColor-0hover-primary ";
const _cn14 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _miw-240px _maw-33--337 ";
const _cn13 = "is_View _pos-relative _fd-row _fwr-wrap _gap-t-space-4 ";
const _cn12 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn11 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-700 _textAlign-left _fs-f-size-9 _lh-f-lineHeigh112928 _ls--0--4px ";
const _cn10 = "is_View _pos-relative _fd-column _gap-t-space-1 ";
const _cn1 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-flex-start _fwr-wrap _gap-t-space-3 ";
const _cn0 = "is_View _pos-relative _fd-column _gap-t-space-5 _flexGrow-1 _flexShrink-1 _fb-auto ";
const _cn9 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn8 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-center _marginTop-t-space-1 ";
const _cn7 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 _WebkitLineClamp-2 _WebkitBoxOrient-vertical _dsp--webkit-box _ox-hidden _oy-hidden ";
const _cn6 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-1 _marginLeft-t-space-2 ";
const _cn5 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-7 _lh-f-lineHeigh112926 _ls--0--2px _flexGrow-1 _flexShrink-1 _fb-auto _maw-10037 _ox-hidden _oy-hidden _textOverflow-ellipsis _ws-nowrap ";
const _cn4 = "is_View _pos-relative _fd-row _jc-space-betwe3241 _ai-flex-start ";
const _cn3 = "is_View _pos-relative _fd-column _paddingTop-t-space-4 _paddingRight-t-space-4 _paddingBottom-t-space-4 _paddingLeft-t-space-4 _gap-t-space-2 ";
const _cn2 = "is_View _pos-relative _fd-column _h-120px _bg-muted _ai-center _jc-center ";
const _cn = "is_View _pos-relative _fd-column _bg-backgroundS110634794 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _ox-hidden _oy-hidden _cur-pointer _bbs-solid _bts-solid _bls-solid _brs-solid _btc-0hover-primary _brc-0hover-primary _borderBottomColor-0hover-primary _borderLeftColor-0hover-primary _o-0hover-0--95 _tr-0active-scale0--981281 ";
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, Button, Badge } from '@antapp/ui';
import type { Collection } from '@/types/api';
import { Bookmark, FolderOpen, Plus, Globe, Lock } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
function CollectionCard({
  collection
}: {
  collection: Collection;
}) {
  const router = useRouter();
  return <div className={_cn} onClick={() => router.push(`/saved/${collection.id}`)}>
      {/* Thumbnail placeholder */}
      <div className={_cn2}>
        {collection.thumbnailUrl ?
      // eslint-disable-next-line @next/next/no-img-element
      <img src={collection.thumbnailUrl} alt="" style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }} /> : <FolderOpen size={40} color="var(--color-mutedForeground)" strokeWidth={1.5} />}
      </div>

      <div className={_cn3}>
        <div className={_cn4}>
          <span className={_cn5}>{collection.name}</span>
          <div className={_cn6}>
            {collection.isPublic ? <Globe size={14} color="var(--color-mutedForeground)" /> : <Lock size={14} color="var(--color-mutedForeground)" />}
          </div>
        </div>

        {collection.description && <span className={_cn7}>{collection.description}</span>}

        <div className={_cn8}>
          <span className={_cn9}>
            {collection.routeCount ?? 0} routes
          </span>
          {collection.isDefault && <Badge variant="info" size="sm">Default</Badge>}
        </div>
      </div>
    </div>;
}
export default function SavedClient({
  collections,
  total
}: {
  collections: Collection[];
  total: number;
}) {
  const router = useRouter();
  return <div className={_cn0}>
      <div className={_cn1}>
        <div className={_cn10}>
          <span className={_cn11}>My Collections</span>
          <span className={_cn12}>Save and organize your favorite routes</span>
        </div>
        {collections.length > 0 && <Button variant="solid" size="md" icon={<Plus size={16} color="#fff" />} onPress={() => {/* TODO: create collection modal */}}>
            New Collection
          </Button>}
      </div>

      {collections.length === 0 ? <EmptyState Icon={Bookmark} title="No collections yet" description="Save routes you love and they'll appear here. Create a collection to organize your adventures." actionLabel="Explore Routes" onAction={() => router.push('/search')} /> : <div className={_cn13}>
          {collections.map(col => <div className={_cn14} key={col.id}>
              <CollectionCard collection={col} />
            </div>)}
          {/* New Collection Card */}
          <div className={_cn15} onClick={() => {/* TODO: create collection modal */}}>
            <div className={_cn16}>
              <Plus size={24} color="var(--color-mutedForeground)" />
            </div>
            <span className={_cn17}>New Collection</span>
            <span className={_cn18}>Organize your saved routes</span>
          </div>
        </div>}
    </div>;
}