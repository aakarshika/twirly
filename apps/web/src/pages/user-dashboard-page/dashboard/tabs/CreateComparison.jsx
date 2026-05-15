import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useHeader } from '@contexts/HeaderContext';
import { useComparisonDraft } from '@contexts/ComparisonDraftContext';
import { searchProducts } from '@services/products';
import {
  createComparison,
  getUnpublishedComparison,
  updateComparison,
  getComparison,
} from '@services/comparisons';
import { Search, Trash2, Pencil, Plus, X, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@styles/themes';
import { getPublicUrlItems } from '@utils/utils';
import AspectForm from './AspectForm';
import ItemCardEditable from '../../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';

const EASE = [0.16, 1, 0.3, 1];

const TITLE_PLACEHOLDERS = [
  'Which phone should I buy?',
  'Best laptop for coding?',
  'Which car for a family?',
  'Gaming console showdown?',
  'Best camera for beginners?',
  'Headphones worth buying?',
  'Which e-reader is best?',
  'Smartwatch battle?',
];

const ItemSlot = ({ item, onEdit, onRemove, isOwner, t }) => {
  const imgSrc = item.image_url?.startsWith('http')
    ? item.image_url
    : item.image_url
      ? getPublicUrlItems(item.image_url)
      : null;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        aspectRatio: '1',
        background: t.bgDeep,
        border: `1.5px solid ${t.ink}18`,
      }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={item.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
        }}
      />
      {!imgSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <span
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: t.ink,
              opacity: 0.7,
              textAlign: 'center',
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </span>
        </div>
      )}
      {imgSrc && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '6px 8px',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 12,
              color: '#fff',
              display: 'block',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </span>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'flex',
          gap: 4,
          zIndex: 3,
        }}
      >
        {isOwner && (
          <button
            onClick={onEdit}
            aria-label="Edit item"
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              borderRadius: 4,
              padding: 5,
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Pencil size={11} />
          </button>
        )}
        <button
          onClick={onRemove}
          aria-label="Remove item"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: 4,
            padding: 5,
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};

const EmptySlot = ({ onAdd, t }) => (
  <button
    onClick={onAdd}
    style={{
      width: '100%',
      aspectRatio: '1',
      borderRadius: 10,
      border: `1.5px dashed ${t.ink}28`,
      background: t.bgDeep,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    }}
  >
    <Plus size={18} style={{ color: t.ink, opacity: 0.35 }} />
    <span
      style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 13,
        color: t.ink,
        opacity: 0.4,
      }}
    >
      add item
    </span>
  </button>
);

const CreateComparison = () => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const { isHeaderVisible } = useHeader();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    draft,
    addItem,
    updateItem,
    removeItem,
    addAspect,
    updateDraft,
    clearDraft,
  } = useComparisonDraft();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingComparisonId, setExistingComparisonId] = useState(null);
  const hasLoadedData = useRef(false);

  // Title placeholder rotation
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(
      () => setPlaceholderIdx(i => (i + 1) % TITLE_PLACEHOLDERS.length),
      2000,
    );
    return () => clearInterval(iv);
  }, []);

  // Item search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Item create / edit modals
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItemModal, setEditItemModal] = useState(null);

  // Aspect state — index-based to avoid ID mismatch for locally-added aspects
  const [showNewAspect, setShowNewAspect] = useState(false);
  const [newAspectData, setNewAspectData] = useState({ metric_name: '' });
  const [editingAspectIdx, setEditingAspectIdx] = useState(null);
  const [editAspectData, setEditAspectData] = useState({ metric_name: '' });

  // Load existing comparison or saved draft on mount
  useEffect(() => {
    if (!user || hasLoadedData.current) return;

    const load = async () => {
      try {
        setSubmitting(true);
        let data = null;

        if (id) {
          data = await getComparison(id, user.id);
          setExistingComparisonId(id);
        } else if (window.location.search.includes('load_draft=true')) {
          data = await getUnpublishedComparison(user.id);
          if (data) setExistingComparisonId(data.id);
        }

        if (data) {
          updateDraft({
            title: data.name,
            description: data.description,
            category_id: data.category_id,
            items: data.comparison_set_items.map(i => i.items),
            aspects: data.comparison_set_aspects.map(a => ({
              id: a.id,
              metric_name: a.metric_name,
              description: a.description,
              weight: a.weight || 1,
            })),
            isPublished: data.isPublished || false,
          });
        } else {
          clearDraft();
        }
        hasLoadedData.current = true;
      } catch (err) {
        setError('Failed to load comparison data.');
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    };

    load();
  }, [user, id]);

  // Debounced item search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const results = await searchProducts(searchQuery);
        if (!stale) setSearchResults(results);
      } catch {
        if (!stale) setSearchResults([]);
      }
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const validate = () => {
    if (!draft.title.trim()) {
      setError('Give your comparison a title first.');
      return false;
    }
    return true;
  };

  const buildPayload = isPublished => ({
    ...draft,
    user_id: user.id,
    isPublished,
    items: draft.items.map(item => ({
      id: item.id,
      user_id: user.id,
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      item_color_string: item.item_color_string,
    })),
  });

  const submit = async isPublished => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      setError(null);
      if (existingComparisonId) {
        await updateComparison(existingComparisonId, buildPayload(isPublished));
      } else {
        await createComparison(buildPayload(isPublished));
      }
      clearDraft();
      navigate('/dashboard/comparisons');
    } catch (err) {
      setError('Something went wrong — please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAspect = () => {
    if (!newAspectData.metric_name.trim()) return;
    addAspect({ metric_name: newAspectData.metric_name.trim(), weight: 1, id: null });
    setNewAspectData({ metric_name: '' });
    setShowNewAspect(false);
  };

  const handleUpdateAspect = () => {
    if (!editAspectData.metric_name.trim()) return;
    updateDraft({
      aspects: draft.aspects.map((a, i) =>
        i === editingAspectIdx
          ? { ...a, metric_name: editAspectData.metric_name.trim() }
          : a,
      ),
    });
    setEditingAspectIdx(null);
  };

  const handleRemoveAspect = idx => {
    updateDraft({ aspects: draft.aspects.filter((_, i) => i !== idx) });
    if (editingAspectIdx === idx) setEditingAspectIdx(null);
  };

  const canAddItems = draft.items.length < 4;
  const isEditMode = !!id;
  const topPad = isHeaderVisible ? 'calc(64px + env(safe-area-inset-top) + 16px)' : '16px';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.ink,
        paddingTop: topPad,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)',
        transition: 'padding-top 0.28s ease',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 24 }}
        >
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 15,
              color: t.ink,
              opacity: 0.45,
              marginBottom: 4,
            }}
          >
            {isEditMode ? 'editing' : 'new comparison'}
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 7vw, 44px)',
              lineHeight: 1.05,
              color: t.ink,
              margin: 0,
            }}
          >
            {isEditMode ? 'edit comparison.' : 'what should\nthe world decide?'}
          </h1>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: `${t.red}12`,
                border: `1.5px solid ${t.red}40`,
                borderRadius: 6,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 14,
                  color: t.red,
                  flex: 1,
                }}
              >
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  color: t.red,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 36,
                  minWidth: 36,
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── THE QUESTION ── */}
        <section style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 12,
              color: t.ink,
              opacity: 0.4,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            the question
          </p>
          <input
            type="text"
            value={draft.title}
            onChange={e => { setError(null); updateDraft({ title: e.target.value }); }}
            placeholder={TITLE_PLACEHOLDERS[placeholderIdx]}
            style={{
              width: '100%',
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 22,
              color: t.ink,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${t.ink}28`,
              outline: 'none',
              padding: '6px 0',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderBottomColor = t.red; }}
            onBlur={e => { e.target.style.borderBottomColor = `${t.ink}28`; }}
          />
        </section>

        {/* ── THE CONTENDERS ── */}
        <section style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 12,
              color: t.ink,
              opacity: 0.4,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            the contenders — {draft.items.length} / 4
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {draft.items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <ItemSlot
                  item={item}
                  t={t}
                  isOwner={item.user_id === user?.id}
                  onEdit={() => setEditItemModal(item)}
                  onRemove={() => removeItem(item.id)}
                />
              </motion.div>
            ))}
            {Array.from({ length: 4 - draft.items.length }).map((_, i) => (
              <EmptySlot
                key={`empty-${i}`}
                t={t}
                onAdd={() => setAddItemModalOpen(true)}
              />
            ))}
          </div>
        </section>

        {/* ── ITEM SEARCH ── */}
        <AnimatePresence>
          {canAddItems && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: 28 }}
            >
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: t.ink,
                    opacity: 0.4,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="search existing items…"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    paddingLeft: 36,
                    paddingRight: searchQuery ? 36 : 14,
                    paddingTop: 10,
                    paddingBottom: 10,
                    fontFamily: '"Fraunces", serif',
                    fontSize: 14,
                    color: t.ink,
                    background: t.bgDeep,
                    border: `1.5px solid ${t.ink}18`,
                    borderRadius: 6,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = `${t.ink}45`; }}
                  onBlur={e => { e.target.style.borderColor = `${t.ink}18`; }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: t.ink,
                      opacity: 0.4,
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 36,
                      minWidth: 36,
                      justifyContent: 'center',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    style={{
                      background: t.bg,
                      border: `1.5px solid ${t.ink}18`,
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    {searchResults.length === 0 ? (
                      <div
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Caveat", cursive',
                            fontSize: 15,
                            color: t.ink,
                            opacity: 0.5,
                          }}
                        >
                          nothing found
                        </span>
                        <button
                          onClick={() => setAddItemModalOpen(true)}
                          style={{
                            fontFamily: '"Fraunces", serif',
                            fontSize: 13,
                            color: t.bg,
                            background: t.red,
                            border: 'none',
                            borderRadius: 4,
                            padding: '5px 12px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          + create new
                        </button>
                      </div>
                    ) : (
                      searchResults.map((product, i) => {
                        const alreadyAdded = draft.items.some(it => it.id === product.id);
                        const imgSrc = product.image_url?.startsWith('http')
                          ? product.image_url
                          : product.image_url
                            ? getPublicUrlItems(product.image_url)
                            : null;
                        return (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.2, ease: EASE }}
                            disabled={alreadyAdded}
                            onClick={() => {
                              if (alreadyAdded) return;
                              addItem(product);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              borderBottom: i < searchResults.length - 1 ? `1px solid ${t.ink}0a` : 'none',
                              cursor: alreadyAdded ? 'default' : 'pointer',
                              opacity: alreadyAdded ? 0.45 : 1,
                              textAlign: 'left',
                            }}
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={product.name}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 4,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  background: t.bgDeep,
                                }}
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 4,
                                  background: `${t.ink}10`,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontFamily: '"Fraunces", serif',
                                fontSize: 14,
                                color: t.ink,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.name}
                            </span>
                            {alreadyAdded ? (
                              <span
                                style={{
                                  fontFamily: '"Caveat", cursive',
                                  fontSize: 12,
                                  color: t.ink,
                                  opacity: 0.4,
                                  flexShrink: 0,
                                }}
                              >
                                added
                              </span>
                            ) : (
                              <Plus size={14} style={{ color: t.ink, opacity: 0.35, flexShrink: 0 }} />
                            )}
                          </motion.button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── ASPECTS ── */}
        <section style={{ marginBottom: 36 }}>
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 12,
              color: t.ink,
              opacity: 0.4,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            what matters? — optional
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {draft.aspects.map((aspect, idx) => (
              <AspectForm
                key={idx}
                aspect={aspect}
                isEditing={editingAspectIdx === idx}
                onEdit={() => {
                  setEditAspectData({ metric_name: aspect.metric_name });
                  setEditingAspectIdx(idx);
                  setShowNewAspect(false);
                }}
                onDelete={() => handleRemoveAspect(idx)}
                onSave={() => handleUpdateAspect()}
                aspectData={editingAspectIdx === idx ? editAspectData : aspect}
                setAspectData={setEditAspectData}
              />
            ))}
          </div>

          {showNewAspect ? (
            <AspectForm
              aspect={{ id: null, metric_name: '' }}
              isEditing
              onEdit={() => {}}
              onDelete={() => { setShowNewAspect(false); setNewAspectData({ metric_name: '' }); }}
              onSave={handleAddAspect}
              aspectData={newAspectData}
              setAspectData={setNewAspectData}
            />
          ) : (
            <button
              onClick={() => {
                setShowNewAspect(true);
                setEditingAspectIdx(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: '"Caveat", cursive',
                fontSize: 14,
                color: t.ink,
                opacity: 0.5,
                background: 'none',
                border: `1px dashed ${t.ink}28`,
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} />
              add what matters
            </button>
          )}
        </section>

        {/* ── ACTIONS ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => submit(false)}
            disabled={submitting}
            style={{
              flex: 1,
              fontFamily: '"Fraunces", serif',
              fontSize: 15,
              color: t.ink,
              background: t.bgDeep,
              border: `1.5px solid ${t.ink}22`,
              borderRadius: 6,
              padding: '12px 16px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.55 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            save draft
          </button>
          <button
            onClick={() => submit(true)}
            disabled={submitting}
            style={{
              flex: 2,
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 16,
              color: t.bg,
              background: submitting ? `${t.red}70` : t.red,
              border: 'none',
              borderRadius: 6,
              padding: '12px 16px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s',
            }}
          >
            {submitting ? 'publishing…' : (
              <>
                publish
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Create item modal */}
      {addItemModalOpen && (
        <ItemCardEditable
          item={{ name: searchQuery }}
          onSave={item => {
            addItem(item);
            setAddItemModalOpen(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
          onCancel={() => setAddItemModalOpen(false)}
        />
      )}

      {/* Edit item modal */}
      {editItemModal && (
        <ItemCardEditable
          item={editItemModal}
          onSave={item => {
            updateItem(item);
            setEditItemModal(null);
          }}
          onCancel={() => setEditItemModal(null)}
        />
      )}
    </div>
  );
};

export default CreateComparison;
