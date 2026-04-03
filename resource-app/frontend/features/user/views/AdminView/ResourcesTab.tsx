import React, { useState } from 'react';
import { useResource } from '../../../resource/context';
import { Card, Button, Badge } from '../../../../components/UI';
import { Plus, ChevronRight } from 'lucide-react';
import { DynamicIcon } from '../../../../components/Icons';
import { Resource } from '../../../resource/types';
import { CreateResourceView } from '../../../resource/views/CreateResourceView';
import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourcesTab = ({ onActiveFullScreen }: { onActiveFullScreen: (active: boolean) => void }) => {
  const { resources, deleteResource } = useResource();
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [viewingResource, setViewingResource] = useState<Resource | undefined>(undefined);

  if (isCreatingResource) {
    return (
      <CreateResourceView
        onClose={() => {
          setIsCreatingResource(false);
          onActiveFullScreen(false);
        }}
      />
    );
  }

  if (viewingResource) {
    return (
      <ResourceDetailsView
        resource={viewingResource}
        onBack={() => {
          setViewingResource(undefined);
          onActiveFullScreen(false);
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-300 pb-16">
        <div className="flex flex-col gap-3">
          {resources.map(res => (
            <button 
              key={res.id} 
              onClick={() => {
                setViewingResource(res);
                onActiveFullScreen(true);
              }}
              className="w-full text-left focus:outline-none group active:scale-[0.98] transition-all"
            >
              <Card className="flex items-center justify-between py-4 group-hover:border-primary-200 group-hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <DynamicIcon name={res.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{res.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="neutral" className="text-[9px] py-0">{res.type}</Badge>
                      <span className="text-[10px] text-slate-400 font-bold">• {Object.keys(res.specs).length} Specs</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
              </Card>
            </button>
          ))}
        </div>
      </div>

      {!isCreatingResource && !viewingResource && (
        <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto pointer-events-none flex justify-end px-4 z-50">
          <button
            className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all pointer-events-auto"
            onClick={() => {
              setIsCreatingResource(true);
              onActiveFullScreen(true);
            }}
            title="Add New Resource"
          >
            <Plus size={24} />
          </button>
        </div>
      )}
    </>
  );
};
