import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DND_MOUSE_DISTANCE, DND_TOUCH_DELAY, DND_TOUCH_TOLERANCE } from '../constants';

export function useDndSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: DND_MOUSE_DISTANCE } }),
    useSensor(TouchSensor, { activationConstraint: { delay: DND_TOUCH_DELAY, tolerance: DND_TOUCH_TOLERANCE } })
  );
}
